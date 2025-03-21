import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import session from "express-session";
import MemoryStore from "memorystore";
import crypto from "crypto";
import { z } from "zod";
import axios from "axios";
import { insertUserSchema, insertKeySchema, insertApiKeySchema, insertUsageLogSchema } from "@shared/schema";

// Session type declaration
declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      role: string;
    };
    authenticated: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  const MemStoreSession = MemoryStore(session);

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "THOMAS_secret_key",
      resave: false,
      saveUninitialized: false,
      store: new MemStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.authenticated) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Utility to get client IP
  const getClientIp = (req: Request): string => {
    return req.ip || 
           req.headers["x-forwarded-for"] as string || 
           req.socket.remoteAddress || 
           "unknown";
  };

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
      }

      const user = await storage.validateCredentials(username, password);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set user session
      req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role,
      };
      req.session.authenticated = true;

      return res.status(200).json({
        message: "Login successful",
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/session", (req, res) => {
    if (req.session.authenticated && req.session.user) {
      return res.status(200).json({
        authenticated: true,
        user: req.session.user,
      });
    }
    return res.status(401).json({
      authenticated: false,
    });
  });

  // Key management routes
  app.get("/api/keys", requireAuth, async (req, res) => {
    try {
      const type = req.query.type as string | undefined;
      const page = parseInt(req.query.page as string || "1");
      const limit = parseInt(req.query.limit as string || "10");

      const result = await storage.listKeys(type, page, limit);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error listing keys:", error);
      return res.status(500).json({ message: "Failed to retrieve keys" });
    }
  });

  app.get("/api/keys/free/today", async (req, res) => {
    try {
      const freeKey = await storage.getTodayFreeKey();
      
      // Log usage if this is a public call (not from admin panel)
      if (!req.session.authenticated) {
        await storage.logKeyUsage({
          keyId: freeKey.id,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"] || "unknown",
          successful: true
        });
      }
      
      return res.status(200).json({ key: freeKey.key });
    } catch (error) {
      console.error("Error getting today's free key:", error);
      return res.status(500).json({ message: "Failed to retrieve today's free key" });
    }
  });

  app.post("/api/keys/vip", requireAuth, async (req, res) => {
    try {
      const { expiryDays, note, count = 1 } = req.body;

      if (!expiryDays) {
        return res.status(400).json({ message: "Expiry days required" });
      }

      const vipKeys = [];
      for (let i = 0; i < count; i++) {
        const vipKey = await storage.createVipKey(expiryDays, note);
        vipKeys.push(vipKey);
      }

      return res.status(201).json({ 
        message: "VIP key(s) created successfully", 
        keys: vipKeys 
      });
    } catch (error) {
      console.error("Error creating VIP key:", error);
      return res.status(500).json({ message: "Failed to create VIP key" });
    }
  });

  app.get("/api/keys/check/:key", async (req, res) => {
    try {
      const { key } = req.params;
      const isValid = await storage.checkKeyValidity(key);
      
      const keyObj = await storage.getKeyByValue(key);
      
      // Log usage
      if (keyObj) {
        await storage.logKeyUsage({
          keyId: keyObj.id,
          ipAddress: getClientIp(req),
          userAgent: req.headers["user-agent"] || "unknown",
          successful: isValid
        });
      }
      
      return res.status(200).json({ 
        valid: isValid,
        type: keyObj?.type || 'unknown'
      });
    } catch (error) {
      console.error("Error checking key validity:", error);
      return res.status(500).json({ message: "Failed to check key validity" });
    }
  });

  // API key management routes
  app.get("/api/apikeys", requireAuth, async (req, res) => {
    try {
      const page = parseInt(req.query.page as string || "1");
      const limit = parseInt(req.query.limit as string || "10");

      const result = await storage.listApiKeys(page, limit);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Error listing API keys:", error);
      return res.status(500).json({ message: "Failed to retrieve API keys" });
    }
  });

  app.post("/api/apikeys", requireAuth, async (req, res) => {
    try {
      const { description, permissions } = req.body;

      if (!description || !permissions) {
        return res.status(400).json({ message: "Description and permissions required" });
      }

      const apiKey = await storage.createApiKey({
        key: crypto.randomBytes(32).toString('hex'),
        description,
        permissions,
        createdBy: req.session.user.id
      });

      return res.status(201).json({ 
        message: "API key created successfully", 
        apiKey 
      });
    } catch (error) {
      console.error("Error creating API key:", error);
      return res.status(500).json({ message: "Failed to create API key" });
    }
  });

  app.put("/api/apikeys/:id/revoke", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid API key ID" });
      }
      
      const success = await storage.revokeApiKey(id);
      
      if (!success) {
        return res.status(404).json({ message: "API key not found" });
      }
      
      return res.status(200).json({ message: "API key revoked successfully" });
    } catch (error) {
      console.error("Error revoking API key:", error);
      return res.status(500).json({ message: "Failed to revoke API key" });
    }
  });

  // Usage logs routes
  app.get("/api/logs/recent", requireAuth, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string || "10");
      const logs = await storage.getRecentUsageLogs(limit);
      
      // Enrich logs with key information
      const enrichedLogs = await Promise.all(logs.map(async (log) => {
        let keyInfo = null;
        let apiKeyInfo = null;
        
        if (log.keyId) {
          const key = await storage.getKey(log.keyId);
          if (key) {
            keyInfo = {
              id: key.id,
              key: key.key,
              type: key.type,
              status: key.status
            };
          }
        }
        
        if (log.apiKeyId) {
          const apiKey = await storage.getApiKey(log.apiKeyId);
          if (apiKey) {
            apiKeyInfo = {
              id: apiKey.id,
              description: apiKey.description
            };
          }
        }
        
        return {
          ...log,
          key: keyInfo,
          apiKey: apiKeyInfo
        };
      }));
      
      return res.status(200).json(enrichedLogs);
    } catch (error) {
      console.error("Error retrieving recent logs:", error);
      return res.status(500).json({ message: "Failed to retrieve recent logs" });
    }
  });

  app.get("/api/logs/ip/:ip", requireAuth, async (req, res) => {
    try {
      const { ip } = req.params;
      const logs = await storage.getUsageByIp(ip);
      
      return res.status(200).json(logs);
    } catch (error) {
      console.error("Error retrieving logs by IP:", error);
      return res.status(500).json({ message: "Failed to retrieve logs by IP" });
    }
  });

  app.get("/api/logs/key/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid key ID" });
      }
      
      const logs = await storage.getKeyUsage(id);
      
      return res.status(200).json(logs);
    } catch (error) {
      console.error("Error retrieving logs by key:", error);
      return res.status(500).json({ message: "Failed to retrieve logs by key" });
    }
  });

  // Dashboard stats
  app.get("/api/stats/dashboard", requireAuth, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      return res.status(200).json(stats);
    } catch (error) {
      console.error("Error retrieving dashboard stats:", error);
      return res.status(500).json({ message: "Failed to retrieve dashboard stats" });
    }
  });

  // Bảng lưu trữ URL rút gọn
  const shortUrls = new Map<string, { destination: string, keyId?: number, createdAt: Date }>();

  // Tạo mã ngẫu nhiên cho URL rút gọn
  const generateShortCode = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // API để tạo URL rút gọn
  app.post("/api/utils/shorten-url", async (req, res) => {
    try {
      const { url, keyId } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      // Validate keyId if provided
      if (keyId !== undefined) {
        const key = await storage.getKey(keyId);
        if (!key) {
          return res.status(400).json({ message: "Invalid key ID" });
        }
      }

      // Generate short code
      const shortCode = generateShortCode();
      
      // Store the mapping
      shortUrls.set(shortCode, {
        destination: url,
        keyId: keyId,
        createdAt: new Date()
      });

      // Generate the full shortened URL
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const shortenedUrl = `${baseUrl}/s/${shortCode}`;

      return res.status(200).json({ 
        status: 'success',
        originalUrl: url,
        shortenedUrl: shortenedUrl,
        keyId: keyId
      });
    } catch (error) {
      console.error("Error shortening URL:", error);
      return res.status(500).json({ message: "Failed to shorten URL" });
    }
  });

  // API sử dụng Yeumoney (giữ lại như yêu cầu cũ)
  app.post("/api/utils/shorten-external", async (req, res) => {
    try {
      const { url, apiToken } = req.body;
      
      if (!url || !apiToken) {
        return res.status(400).json({ message: "URL and API token are required" });
      }

      // Validate URL format
      try {
        new URL(url);
      } catch (error) {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      // Log key usage if request includes a key
      const { key } = req.query;
      if (key) {
        const keyObj = await storage.getKeyByValue(key as string);
        if (keyObj) {
          await storage.logKeyUsage({
            keyId: keyObj.id,
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"] || "unknown",
            successful: true
          });
        }
      }

      // Call the URL shortener API
      const encodedUrl = encodeURIComponent(url);
      const apiUrl = `https://yeumoney.com/QL_api.php?token=${apiToken}&url=${encodedUrl}&format=json`;
      
      const response = await axios.get(apiUrl);
      const data = response.data;

      if (data.status === 'success') {
        return res.status(200).json({ 
          status: 'success',
          originalUrl: url,
          shortenedUrl: data.shortenedUrl 
        });
      } else {
        return res.status(400).json({ 
          status: 'error',
          message: data.status || 'Failed to shorten URL'
        });
      }
    } catch (error) {
      console.error("Error shortening URL:", error);
      return res.status(500).json({ message: "Failed to shorten URL" });
    }
  });

  // API để tạo Pastebin
  app.post("/api/utils/create-pastebin", async (req, res) => {
    try {
      const { content, title } = req.body;
      
      if (!content || !title) {
        return res.status(400).json({ message: "Content and title are required" });
      }

      // Log key usage if request includes a key
      const { key } = req.query;
      let keyObj = null;
      if (key) {
        keyObj = await storage.getKeyByValue(key as string);
        if (keyObj) {
          await storage.logKeyUsage({
            keyId: keyObj.id,
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"] || "unknown",
            successful: true
          });
        }
      }

      // API key cho Pastebin
      const apiKey = process.env.PASTEBIN_API_KEY || "SBAT7rqPLbsxkLlDyzBUnuHTd1lGq68x"; // Sử dụng API key từ môi trường hoặc giá trị mặc định

      // Tạo form data
      const formData = new URLSearchParams();
      formData.append('api_dev_key', apiKey);
      formData.append('api_option', 'paste');
      formData.append('api_paste_code', content);
      formData.append('api_paste_name', title);
      formData.append('api_paste_format', 'text');
      formData.append('api_paste_private', '0'); // 0 = public, 1 = unlisted, 2 = private
      formData.append('api_paste_expire_date', '1M'); // 1 tháng

      // Gọi API Pastebin
      const apiUrl = 'https://pastebin.com/api/api_post.php';
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      // Phân tích phản hồi
      const pasteUrl = response.data;
      
      // Kiểm tra trường hợp lỗi
      if (pasteUrl.startsWith('Bad API request')) {
        return res.status(400).json({
          status: 'error',
          message: pasteUrl
        });
      }

      return res.status(200).json({
        status: 'success',
        originalUrl: title,
        shortenedUrl: pasteUrl
      });
      
    } catch (error) {
      console.error("Error creating pastebin:", error);
      return res.status(500).json({ message: "Failed to create pastebin" });
    }
  });

  // Route xử lý URL rút gọn 
  app.get("/s/:shortCode", async (req, res) => {
    try {
      const { shortCode } = req.params;
      const urlMapping = shortUrls.get(shortCode);

      if (!urlMapping) {
        return res.status(404).send("URL not found");
      }

      // Nếu URL rút gọn này có liên kết với key
      if (urlMapping.keyId) {
        const key = await storage.getKey(urlMapping.keyId);
        
        if (key) {
          // Ghi nhận việc sử dụng key
          await storage.logKeyUsage({
            keyId: key.id,
            ipAddress: getClientIp(req),
            userAgent: req.headers["user-agent"] || "unknown",
            successful: true
          });
          
          // Chuyển hướng đến trang key
          return res.redirect(`/key-verified?key=${encodeURIComponent(key.key)}`);
        }
      }

      // Chuyển hướng đến URL đích
      return res.redirect(urlMapping.destination);
    } catch (error) {
      console.error("Error redirecting short URL:", error);
      return res.status(500).send("An error occurred while redirecting");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

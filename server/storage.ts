import { v4 as uuidv4 } from 'uuid';
import { 
  User, InsertUser, 
  Key, InsertKey, 
  ApiKey, InsertApiKey, 
  UsageLog, InsertUsageLog,
  Setting, InsertSetting,
  DashboardStats
} from '@shared/schema';
import crypto from 'crypto';

// Utility functions
const getCurrentTimestamp = () => new Date();
const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

// Generate daily free key based on the day
const generateFreeKey = (): string => {
  const now = new Date();
  const day = now.getDate();
  return `THOMAS-${day * 2593885817 + 4610273}`;
};

// Generate random VIP key
const generateVipKey = (prefix = 'THOMAS_', length = 12): string => {
  const randomChars = crypto.randomBytes(length)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length);
  return `${prefix}${randomChars}`;
};

// Generate API key
const generateApiKey = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateCredentials(username: string, password: string): Promise<User | null>;
  
  // Key operations
  getKey(id: number): Promise<Key | undefined>;
  getKeyByValue(key: string): Promise<Key | undefined>;
  createKey(key: InsertKey): Promise<Key>;
  listKeys(type?: string, page?: number, limit?: number): Promise<{ keys: Key[], total: number }>;
  checkKeyValidity(key: string): Promise<boolean>;
  cleanupExpiredKeys(): Promise<number>;
  getTodayFreeKey(): Promise<Key>;
  createVipKey(expiryDays?: number, note?: string): Promise<Key>;

  // API Key operations
  getApiKey(id: number): Promise<ApiKey | undefined>;
  getApiKeyByValue(key: string): Promise<ApiKey | undefined>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  listApiKeys(page?: number, limit?: number): Promise<{ apiKeys: ApiKey[], total: number }>;
  revokeApiKey(id: number): Promise<boolean>;

  // Usage logs
  logKeyUsage(log: InsertUsageLog): Promise<UsageLog>;
  getKeyUsage(keyId: number): Promise<UsageLog[]>;
  getRecentUsageLogs(limit?: number): Promise<UsageLog[]>;
  getUsageByIp(ipAddress: string): Promise<UsageLog[]>;

  // Settings
  getSetting(name: string): Promise<Setting | undefined>;
  updateSetting(name: string, value: string, userId: number): Promise<Setting>;

  // Dashboard stats
  getDashboardStats(): Promise<DashboardStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private keys: Map<number, Key>;
  private apiKeys: Map<number, ApiKey>;
  private usageLogs: Map<number, UsageLog>;
  private settings: Map<string, Setting>;
  
  private userIdCounter: number;
  private keyIdCounter: number;
  private apiKeyIdCounter: number;
  private usageLogIdCounter: number;
  private settingIdCounter: number;

  constructor() {
    this.users = new Map();
    this.keys = new Map();
    this.apiKeys = new Map();
    this.usageLogs = new Map();
    this.settings = new Map();
    
    this.userIdCounter = 1;
    this.keyIdCounter = 1;
    this.apiKeyIdCounter = 1;
    this.usageLogIdCounter = 1;
    this.settingIdCounter = 1;

    // Initialize with a default admin user
    this.createUser({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });

    // Initialize today's free key
    this.createOrUpdateTodayFreeKey();

    // Set up automatic cleanup of expired keys
    this.setupKeyCleanup();
  }

  // Helper method to create or update today's free key
  private async createOrUpdateTodayFreeKey(): Promise<void> {
    const freeKey = generateFreeKey();
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    // Check if today's free key already exists
    let existingKey: Key | undefined;
    for (const key of this.keys.values()) {
      if (key.key === freeKey && key.type === 'free') {
        existingKey = key;
        break;
      }
    }

    if (!existingKey) {
      await this.createKey({
        key: freeKey,
        type: 'free',
        status: 'active',
        expiresAt: tomorrow,
        userId: 1, // Admin user
        note: 'Auto-generated free key'
      });
    }
  }

  // Setup automatic key cleanup
  private setupKeyCleanup(): void {
    // In a real application, this would be a cron job
    // For this demo, we'll just run it periodically
    setInterval(() => {
      this.cleanupExpiredKeys();
      this.createOrUpdateTodayFreeKey();
    }, 1000 * 60 * 60); // Check every hour
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => 
      user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const now = getCurrentTimestamp();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: now 
    };
    this.users.set(id, user);
    return user;
  }

  async validateCredentials(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }

  // Key methods
  async getKey(id: number): Promise<Key | undefined> {
    return this.keys.get(id);
  }

  async getKeyByValue(key: string): Promise<Key | undefined> {
    return Array.from(this.keys.values()).find(k => k.key === key);
  }

  async createKey(insertKey: InsertKey): Promise<Key> {
    const id = this.keyIdCounter++;
    const now = getCurrentTimestamp();
    const key: Key = { 
      ...insertKey, 
      id, 
      createdAt: now 
    };
    this.keys.set(id, key);
    return key;
  }

  async listKeys(type?: string, page = 1, limit = 10): Promise<{ keys: Key[], total: number }> {
    let filteredKeys = Array.from(this.keys.values());
    
    if (type) {
      filteredKeys = filteredKeys.filter(key => key.type === type);
    }
    
    const total = filteredKeys.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    // Sort keys by creation date, newest first
    filteredKeys.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return {
      keys: filteredKeys.slice(start, end),
      total
    };
  }

  async checkKeyValidity(key: string): Promise<boolean> {
    const keyObject = await this.getKeyByValue(key);
    
    if (!keyObject) {
      return false;
    }
    
    if (keyObject.status !== 'active') {
      return false;
    }
    
    if (keyObject.expiresAt && new Date(keyObject.expiresAt) < new Date()) {
      // Key has expired, update its status
      keyObject.status = 'expired';
      this.keys.set(keyObject.id, keyObject);
      return false;
    }
    
    return true;
  }

  async cleanupExpiredKeys(): Promise<number> {
    let count = 0;
    const now = new Date();
    
    for (const [id, key] of this.keys.entries()) {
      if (key.expiresAt && new Date(key.expiresAt) < now && key.status === 'active') {
        key.status = 'expired';
        this.keys.set(id, key);
        count++;
      }
    }
    
    return count;
  }

  async getTodayFreeKey(): Promise<Key> {
    const freeKeyValue = generateFreeKey();
    let freeKey = await this.getKeyByValue(freeKeyValue);
    
    if (!freeKey) {
      // Create today's free key if it doesn't exist
      freeKey = await this.createKey({
        key: freeKeyValue,
        type: 'free',
        status: 'active',
        expiresAt: addDays(new Date(), 1),
        userId: 1, // Admin
        note: 'Auto-generated free key'
      });
    }
    
    return freeKey;
  }

  async createVipKey(expiryDays = 30, note = ''): Promise<Key> {
    const vipKey = generateVipKey();
    let expiresAt = null;
    
    if (expiryDays > 0) {
      expiresAt = addDays(new Date(), expiryDays);
    }
    
    return this.createKey({
      key: vipKey,
      type: 'vip',
      status: 'active',
      expiresAt,
      userId: 1, // Admin
      note
    });
  }

  // API Key methods
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    return this.apiKeys.get(id);
  }

  async getApiKeyByValue(key: string): Promise<ApiKey | undefined> {
    return Array.from(this.apiKeys.values()).find(k => k.key === key);
  }

  async createApiKey(insertApiKey: InsertApiKey): Promise<ApiKey> {
    const id = this.apiKeyIdCounter++;
    const now = getCurrentTimestamp();
    
    // Generate a unique API key if not provided
    const apiKeyValue = insertApiKey.key || generateApiKey();
    
    const apiKey: ApiKey = {
      ...insertApiKey,
      key: apiKeyValue,
      id,
      createdAt: now,
      status: 'active'
    };
    
    this.apiKeys.set(id, apiKey);
    return apiKey;
  }

  async listApiKeys(page = 1, limit = 10): Promise<{ apiKeys: ApiKey[], total: number }> {
    const allApiKeys = Array.from(this.apiKeys.values());
    const total = allApiKeys.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    // Sort by creation date, newest first
    allApiKeys.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    return {
      apiKeys: allApiKeys.slice(start, end),
      total
    };
  }

  async revokeApiKey(id: number): Promise<boolean> {
    const apiKey = await this.getApiKey(id);
    
    if (!apiKey) {
      return false;
    }
    
    apiKey.status = 'revoked';
    this.apiKeys.set(id, apiKey);
    return true;
  }

  // Usage logs
  async logKeyUsage(insertLog: InsertUsageLog): Promise<UsageLog> {
    const id = this.usageLogIdCounter++;
    const now = getCurrentTimestamp();
    
    const log: UsageLog = {
      ...insertLog,
      id,
      timestamp: now
    };
    
    this.usageLogs.set(id, log);
    return log;
  }

  async getKeyUsage(keyId: number): Promise<UsageLog[]> {
    return Array.from(this.usageLogs.values())
      .filter(log => log.keyId === keyId)
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  async getRecentUsageLogs(limit = 10): Promise<UsageLog[]> {
    return Array.from(this.usageLogs.values())
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
      .slice(0, limit);
  }

  async getUsageByIp(ipAddress: string): Promise<UsageLog[]> {
    return Array.from(this.usageLogs.values())
      .filter(log => log.ipAddress === ipAddress)
      .sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
  }

  // Settings
  async getSetting(name: string): Promise<Setting | undefined> {
    return this.settings.get(name);
  }

  async updateSetting(name: string, value: string, userId: number): Promise<Setting> {
    const now = getCurrentTimestamp();
    
    const existingSetting = this.settings.get(name);
    
    if (existingSetting) {
      existingSetting.value = value;
      existingSetting.updatedAt = now;
      existingSetting.updatedBy = userId;
      this.settings.set(name, existingSetting);
      return existingSetting;
    } else {
      const id = this.settingIdCounter++;
      const setting: Setting = {
        id,
        name,
        value,
        updatedAt: now,
        updatedBy: userId
      };
      this.settings.set(name, setting);
      return setting;
    }
  }

  // Dashboard stats
  async getDashboardStats(): Promise<DashboardStats> {
    // Get total keys
    const allKeys = Array.from(this.keys.values());
    const totalKeys = allKeys.length;
    
    // Get active keys
    const activeKeys = allKeys.filter(key => 
      key.status === 'active' && 
      (!key.expiresAt || new Date(key.expiresAt) > new Date())
    ).length;
    
    // Get VIP users (count unique VIP keys)
    const vipKeys = allKeys.filter(key => key.type === 'vip');
    const vipUsers = vipKeys.length;
    
    // Get API requests per day (last 7 days)
    const usageLogs = Array.from(this.usageLogs.values());
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const recentLogs = usageLogs.filter(log => 
      new Date(log.timestamp) >= lastWeek
    );
    
    // Group logs by day
    const usageByDay = new Map<string, number>();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      usageByDay.set(dateStr, 0);
    }
    
    for (const log of recentLogs) {
      const dateStr = new Date(log.timestamp).toISOString().split('T')[0];
      const count = usageByDay.get(dateStr) || 0;
      usageByDay.set(dateStr, count + 1);
    }
    
    const usageStats = Array.from(usageByDay.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    // Calculate key distribution
    const freeKeys = allKeys.filter(key => key.type === 'free').length;
    
    return {
      totalKeys,
      activeKeys,
      vipUsers,
      apiRequests: recentLogs.length,
      keyDistribution: {
        free: freeKeys,
        vip: vipUsers
      },
      usageStats
    };
  }
}

export const storage = new MemStorage();

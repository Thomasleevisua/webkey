import { apiRequest } from "@/lib/queryClient";

/**
 * API functions related to statistics and usage tracking
 */

/**
 * Fetches dashboard statistics
 * @returns A promise resolving to the dashboard statistics data
 */
export async function getDashboardStats() {
  const response = await apiRequest('GET', '/api/stats/dashboard');
  return response.json();
}

/**
 * Fetches usage statistics
 * @param timeRange Optional time range filter ('7', '30', or '90' days)
 * @returns A promise resolving to the usage statistics data
 */
export async function getUsageStats(timeRange: string = '30') {
  const response = await apiRequest('GET', `/api/stats/usage?timeRange=${timeRange}`);
  return response.json();
}

/**
 * Fetches recent usage logs
 * @param page Page number for pagination
 * @param limit Number of items per page
 * @returns A promise resolving to the usage logs data
 */
export async function getRecentLogs(page: number = 1, limit: number = 15) {
  const response = await apiRequest('GET', `/api/logs/recent?page=${page}&limit=${limit}`);
  return response.json();
}

/**
 * Fetches logs for a specific IP address
 * @param ipAddress The IP address to get logs for
 * @returns A promise resolving to the IP address logs data
 */
export async function getIpLogs(ipAddress: string) {
  const response = await apiRequest('GET', `/api/logs/ip/${encodeURIComponent(ipAddress)}`);
  return response.json();
}

/**
 * Fetches logs for a specific key
 * @param keyId The key ID to get logs for
 * @returns A promise resolving to the key usage logs data
 */
export async function getKeyLogs(keyId: number) {
  const response = await apiRequest('GET', `/api/logs/key/${keyId}`);
  return response.json();
}

/**
 * Fetches system settings
 * @returns A promise resolving to the system settings data
 */
export async function getSystemSettings() {
  const response = await apiRequest('GET', '/api/settings');
  return response.json();
}

/**
 * Updates system settings
 * @param settings The settings to update
 * @returns A promise resolving to the updated settings data
 */
export async function updateSystemSettings(settings: Record<string, string>) {
  const response = await apiRequest('POST', '/api/settings', settings);
  return response.json();
}

export default {
  getDashboardStats,
  getUsageStats,
  getRecentLogs,
  getIpLogs,
  getKeyLogs,
  getSystemSettings,
  updateSystemSettings
};

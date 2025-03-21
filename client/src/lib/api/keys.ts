import { apiRequest } from "@/lib/queryClient";

/**
 * API functions related to key management
 */

/**
 * Fetches a list of keys with optional filtering
 * @param type Optional type filter ('free' or 'vip')
 * @param page Page number for pagination
 * @param limit Number of items per page
 * @returns A promise resolving to the keys data
 */
export async function getKeys(type?: string, page: number = 1, limit: number = 10) {
  const queryParams = new URLSearchParams();
  if (type) queryParams.append('type', type);
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  
  const response = await apiRequest('GET', `/api/keys?${queryParams.toString()}`);
  return response.json();
}

/**
 * Fetches today's free key
 * @returns A promise resolving to the free key data
 */
export async function getTodayFreeKey() {
  const response = await apiRequest('GET', '/api/keys/free/today');
  return response.json();
}

/**
 * Creates a new VIP key
 * @param options Options for creating the VIP key
 * @returns A promise resolving to the created key data
 */
export async function createVipKey(options: {
  expiryDays?: number;
  count?: number;
  note?: string;
}) {
  const response = await apiRequest('POST', '/api/keys/vip', options);
  return response.json();
}

/**
 * Resets/regenerates the free key
 * @returns A promise resolving to the new free key data
 */
export async function resetFreeKey() {
  const response = await apiRequest('POST', '/api/keys/free/reset', {});
  return response.json();
}

/**
 * Checks if a key is valid
 * @param key The key to check
 * @returns A promise resolving to the key validity information
 */
export async function checkKeyValidity(key: string) {
  const response = await apiRequest('GET', `/api/keys/check/${encodeURIComponent(key)}`);
  return response.json();
}

/**
 * Deletes a specific key
 * @param keyId The ID of the key to delete
 * @returns A promise resolving to the deletion result
 */
export async function deleteKey(keyId: number) {
  const response = await apiRequest('DELETE', `/api/keys/${keyId}`);
  return response.json();
}

/**
 * Runs a cleanup operation to mark expired keys as inactive
 * @returns A promise resolving to the cleanup result
 */
export async function runKeyCleanup() {
  const response = await apiRequest('POST', '/api/keys/cleanup', {});
  return response.json();
}

/**
 * Deletes all free keys from the system
 * @returns A promise resolving to the deletion result
 */
export async function clearAllFreeKeys() {
  const response = await apiRequest('DELETE', '/api/keys/free/all', {});
  return response.json();
}

export default {
  getKeys,
  getTodayFreeKey,
  createVipKey,
  resetFreeKey,
  checkKeyValidity,
  deleteKey,
  runKeyCleanup,
  clearAllFreeKeys
};

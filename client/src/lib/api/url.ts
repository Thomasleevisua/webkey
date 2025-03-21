import { apiRequest } from "@/lib/queryClient";

/**
 * API functions related to URL shortening
 */

/**
 * Shortens a URL using the built-in URL shortener
 * @param url The URL to shorten
 * @param keyId Optional key ID to link to this URL
 * @returns A promise resolving to the shortened URL
 */
export async function shortenUrl(url: string, keyId?: number) {
  const response = await apiRequest('POST', '/api/utils/shorten-url', { 
    url,
    keyId
  });
  return response.json();
}

/**
 * Creates a paste on Pastebin and returns the URL
 * @param content The content to paste
 * @param title The title of the paste
 * @param key Optional key for tracking usage
 * @returns A promise resolving to the Pastebin URL
 */
export async function createPastebin(content: string, title: string, key?: string) {
  const response = await apiRequest('POST', '/api/utils/create-pastebin', { 
    content, 
    title,
    key 
  });
  return response.json();
}

/**
 * Shortens a URL using the external Yeumoney API
 * @param url The URL to shorten
 * @param apiToken The API token for yeumoney.com
 * @param key Optional key for tracking usage
 * @returns A promise resolving to the shortened URL
 */
export async function shortenUrlExternal(url: string, apiToken: string, key?: string) {
  const queryParams = key ? `?key=${encodeURIComponent(key)}` : '';
  const response = await apiRequest('POST', `/api/utils/shorten-external${queryParams}`, { 
    url, 
    apiToken 
  });
  return response.json();
}

export default {
  shortenUrl,
  shortenUrlExternal,
  createPastebin
};
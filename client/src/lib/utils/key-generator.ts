/**
 * Generates a random key with specified prefix and length
 * @param prefix Prefix to append to the beginning of the key
 * @param length Length of the random part of the key
 * @returns A randomly generated key
 */
export function generateRandomKey(prefix: string = "THOMAS_", length: number = 12): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = prefix;
  
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  
  return result;
}

/**
 * Generates a daily free key based on the current day
 * @returns A free key for the current day
 */
export function generateFreeKey(): string {
  const today = new Date();
  const day = today.getDate();
  return `THOMAS-${day * 2593885817 + 4610273}`;
}

/**
 * Formats a key for display by adding a dash every 4 characters
 * @param key The key to format
 * @returns Formatted key with dashes
 */
export function formatKey(key: string): string {
  if (!key) return "";
  
  // If it's already a properly formatted key, return it as is
  if (key.startsWith("THOMAS-") || key.startsWith("THOMAS_")) {
    return key;
  }
  
  // Add dashes every 4 characters for better readability
  const formattedKey = key.replace(/(.{4})/g, "$1-").slice(0, -1);
  return formattedKey;
}

/**
 * Validates a key format
 * @param key The key to validate
 * @returns True if the key format is valid
 */
export function isValidKeyFormat(key: string): boolean {
  // Check if it's a free key (THOMAS-number)
  if (/^THOMAS-\d+$/.test(key)) {
    return true;
  }
  
  // Check if it's a VIP key (THOMAS_alphanumeric)
  if (/^THOMAS_[a-zA-Z0-9]+$/.test(key)) {
    return true;
  }
  
  return false;
}

/**
 * Determines the key type based on its format
 * @param key The key to check
 * @returns "free", "vip", or "unknown"
 */
export function getKeyType(key: string): "free" | "vip" | "unknown" {
  if (/^THOMAS-\d+$/.test(key)) {
    return "free";
  }
  
  if (/^THOMAS_[a-zA-Z0-9]+$/.test(key)) {
    return "vip";
  }
  
  return "unknown";
}

export default {
  generateRandomKey,
  generateFreeKey,
  formatKey,
  isValidKeyFormat,
  getKeyType
};

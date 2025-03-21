import { apiRequest } from "@/lib/queryClient";

/**
 * API functions related to authentication
 */

/**
 * Login to the system
 * @param username Username to login with
 * @param password Password for authentication
 * @returns A promise resolving to the login result
 */
export async function login(username: string, password: string) {
  const response = await apiRequest('POST', '/api/auth/login', { username, password });
  return response.json();
}

/**
 * Logout from the system
 * @returns A promise resolving when logout is complete
 */
export async function logout() {
  const response = await apiRequest('POST', '/api/auth/logout', {});
  return response.json();
}

/**
 * Get the current user session information
 * @returns A promise resolving to the session information
 */
export async function getSession() {
  const response = await apiRequest('GET', '/api/auth/session');
  return response.json();
}

/**
 * Change the admin password
 * @param oldPassword Current password
 * @param newPassword New password to set
 * @returns A promise resolving to the password change result
 */
export async function changePassword(oldPassword: string, newPassword: string) {
  const response = await apiRequest('POST', '/api/auth/password', { 
    oldPassword, 
    newPassword 
  });
  return response.json();
}

export default {
  login,
  logout,
  getSession,
  changePassword
};

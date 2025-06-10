/**
 * auth-utils.ts - Client-safe authentication utilities
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

// This file contains functions that can be safely imported on the client side
// without causing issues with Next.js bundling or Cloudflare integration.

/**
 * Check if a user is authenticated based on a user object
 */
export const isAuthenticated = (user: any): boolean => {
  return !!user && !!user.id;
};

/**
 * Check if a user has admin privileges
 */
export const isAdmin = (user: any): boolean => {
  return isAuthenticated(user) && !!user.isAdmin;
};

/**
 * Parse JWT token payload without verification
 * (For client-side display only, actual verification happens on the server)
 */
export const parseToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to parse token:', error);
    return null;
  }
};

/**
 * Check if a token is expired based on its payload
 * (For client-side display only, actual verification happens on the server)
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = parseToken(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
};

export default {
  isAuthenticated,
  isAdmin,
  parseToken,
  isTokenExpired,
};

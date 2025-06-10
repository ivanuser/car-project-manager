/**
 * api-helpers.ts - Helper functions for API routes
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Cookie names for auth tokens
const AUTH_COOKIE_NAME = 'cajpro_auth_token';
const REFRESH_COOKIE_NAME = 'cajpro_refresh_token';

/**
 * Safely import server-side auth modules for API routes
 */
export const getServerAuth = async () => {
  try {
    // Dynamic import of server-only module
    const { importServerModules } = await import('./server-only');
    return await importServerModules();
  } catch (error) {
    console.error('Failed to import server auth modules:', error);
    throw new Error('Server authentication unavailable');
  }
};

/**
 * Get authentication token from cookies or headers
 */
export const getAuthToken = (req: NextRequest): string | null => {
  // Try to get token from cookies
  const cookieStore = cookies();
  const tokenCookie = cookieStore.get(AUTH_COOKIE_NAME);

  if (tokenCookie) {
    return tokenCookie.value;
  }

  // Try to get token from Authorization header
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7); // Remove 'Bearer ' prefix
  }

  return null;
};

/**
 * Get refresh token from cookies
 */
export const getRefreshToken = (): string | null => {
  const cookieStore = cookies();
  const refreshTokenCookie = cookieStore.get(REFRESH_COOKIE_NAME);

  if (refreshTokenCookie) {
    return refreshTokenCookie.value;
  }

  return null;
};

/**
 * Set authentication cookies
 */
export const setAuthCookies = (
  response: NextResponse,
  token: string,
  refreshToken: string
): NextResponse => {
  // JWT expiration time (default: 1 hour)
  const jwtExpiration = process.env.JWT_EXPIRATION
    ? parseInt(process.env.JWT_EXPIRATION, 10)
    : 3600; // 1 hour in seconds
    
  // Refresh token expiration time (default: 7 days)
  const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION
    ? parseInt(process.env.REFRESH_TOKEN_EXPIRATION, 10)
    : 604800; // 7 days in seconds
  
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true, // Always use secure cookies with Cloudflare tunnel
    sameSite: 'lax', // Use 'lax' instead of 'strict' for better compatibility with Cloudflare
    path: '/',
    maxAge: jwtExpiration,
  });
  
  response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: true, // Always use secure cookies with Cloudflare tunnel
    sameSite: 'lax', // Use 'lax' instead of 'strict' for better compatibility with Cloudflare
    path: '/',
    maxAge: refreshTokenExpiration,
  });
  
  return response;
};

/**
 * Clear authentication cookies
 */
export const clearAuthCookies = (response: NextResponse): NextResponse => {
  response.cookies.delete(AUTH_COOKIE_NAME);
  response.cookies.delete(REFRESH_COOKIE_NAME);
  
  return response;
};

/**
 * Create a standardized error response
 */
export const createErrorResponse = (message: string, status: number = 500): NextResponse => {
  return NextResponse.json(
    { error: message },
    { status }
  );
};

export default {
  getServerAuth,
  getAuthToken,
  getRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  createErrorResponse,
};

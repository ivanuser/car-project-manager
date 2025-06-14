/**
 * middleware.ts - Authentication middleware
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwtUtils from './jwt';

// Cookie name for the authentication token
const AUTH_COOKIE_NAME = 'cajpro_auth_token';
// Cookie name for the refresh token
const REFRESH_COOKIE_NAME = 'cajpro_refresh_token';

/**
 * Get authentication token from cookies or headers
 * @param req - Next.js request
 * @returns Token or null if not found
 */
export const getToken = (req: NextRequest): string | null => {
  // Try to get token from cookies
  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (token) {
    return token;
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
 * @param req - Next.js request
 * @returns Refresh token or null if not found
 */
export const getRefreshToken = (req: NextRequest): string | null => {
  const refreshToken = req.cookies.get(REFRESH_COOKIE_NAME)?.value;
  if (refreshToken) {
    return refreshToken;
  }
  return null;
};

/**
 * Middleware to check if user is authenticated
 * @param req - Next.js request
 * @returns NextResponse or null if authenticated
 */
export const requireAuth = async (req: NextRequest): Promise<NextResponse | null> => {
  const token = getToken(req);

  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Verify token
  const payload = jwtUtils.verifyToken(token);
  if (!payload || jwtUtils.isTokenExpired(token)) {
    // Try to refresh token
    const refreshToken = getRefreshToken(req);
    if (refreshToken) {
      try {
        // We'll need to implement this in a server action or API route
        // since middleware cannot directly access the database
        return NextResponse.redirect(new URL('/api/auth/refresh', req.url));
      } catch (error) {
        // Failed to refresh token
        const response = NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        );
        
        // Clear cookies
        response.cookies.delete(AUTH_COOKIE_NAME);
        response.cookies.delete(REFRESH_COOKIE_NAME);
        
        return response;
      }
    }
    
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }

  // User is authenticated
  return null;
};

/**
 * Set authentication cookies
 * @param response - Next.js response
 * @param token - JWT token
 * @param refreshToken - Refresh token
 * @returns NextResponse with cookies
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
  
  // Determine if we should use secure cookies
  // Only use secure in production or when specifically enabled
  const isProduction = process.env.NODE_ENV === 'production';
  const forceSecure = process.env.FORCE_SECURE_COOKIES === 'true';
  const useSecure = isProduction || forceSecure;
  
  console.log('Setting auth cookies with secure:', useSecure);
  
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: useSecure, // Only secure in production or when forced
    sameSite: 'lax',
    path: '/',
    maxAge: jwtExpiration,
  });
  
  response.cookies.set(REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: useSecure, // Only secure in production or when forced
    sameSite: 'lax',
    path: '/',
    maxAge: refreshTokenExpiration,
  });
  
  return response;
};

/**
 * Clear authentication cookies
 * @param response - Next.js response
 * @returns NextResponse without cookies
 */
export const clearAuthCookies = (response: NextResponse): NextResponse => {
  response.cookies.delete(AUTH_COOKIE_NAME);
  response.cookies.delete(REFRESH_COOKIE_NAME);
  
  return response;
};

export default {
  getToken,
  getRefreshToken,
  requireAuth,
  setAuthCookies,
  clearAuthCookies,
};
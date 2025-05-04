/**
 * middleware.ts - Authentication middleware
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwtUtils from './jwt';
import authService from './auth-service';

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
 * @param req - Next.js request
 * @returns Refresh token or null if not found
 */
export const getRefreshToken = (req: NextRequest): string | null => {
  const cookieStore = cookies();
  const refreshTokenCookie = cookieStore.get(REFRESH_COOKIE_NAME);

  if (refreshTokenCookie) {
    return refreshTokenCookie.value;
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
  const user = await authService.validateSession(token);
  if (!user) {
    // Try to refresh token
    const refreshToken = getRefreshToken(req);
    if (refreshToken) {
      try {
        const refreshResult = await authService.refreshAuth(refreshToken);
        
        // Set new tokens in cookies
        const response = NextResponse.next();
        response.cookies.set(AUTH_COOKIE_NAME, refreshResult.token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 3600, // 1 hour
        });
        
        response.cookies.set(REFRESH_COOKIE_NAME, refreshResult.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          path: '/',
          maxAge: 604800, // 7 days
        });
        
        return response;
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
 * Middleware to check if user is admin
 * @param req - Next.js request
 * @returns NextResponse or null if user is admin
 */
export const requireAdmin = async (req: NextRequest): Promise<NextResponse | null> => {
  const authResult = await requireAuth(req);
  if (authResult) {
    return authResult; // Not authenticated
  }

  const token = getToken(req);
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Get user ID from token
  const userId = jwtUtils.getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    );
  }

  // Check if user is admin
  const isAdmin = await authService.isAdmin(userId);
  if (!isAdmin) {
    return NextResponse.json(
      { error: 'Admin privileges required' },
      { status: 403 }
    );
  }

  // User is admin
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
  requireAdmin,
  setAuthCookies,
  clearAuthCookies,
};

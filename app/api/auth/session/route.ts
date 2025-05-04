/**
 * session/route.ts - API endpoint for getting current session
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService, authMiddleware } from '@/lib/auth';

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    // Get token from cookies or headers
    const token = authMiddleware.getToken(req);
    
    if (!token) {
      return NextResponse.json(
        { user: null, authenticated: false },
        { status: 200 }
      );
    }
    
    // Validate session
    const user = await authService.validateSession(token);
    
    if (!user) {
      // Try to refresh token
      const refreshToken = authMiddleware.getRefreshToken(req);
      
      if (refreshToken) {
        try {
          const refreshResult = await authService.refreshAuth(refreshToken);
          
          // Set new auth cookies
          const response = NextResponse.json({
            user: {
              id: refreshResult.user.id,
              email: refreshResult.user.email,
              isAdmin: refreshResult.user.isAdmin,
            },
            authenticated: true,
          });
          
          return authMiddleware.setAuthCookies(
            response,
            refreshResult.token,
            refreshResult.refreshToken
          );
        } catch (error) {
          // Failed to refresh token
          const response = NextResponse.json(
            { user: null, authenticated: false },
            { status: 200 }
          );
          
          return authMiddleware.clearAuthCookies(response);
        }
      }
      
      // No refresh token or failed to refresh
      return NextResponse.json(
        { user: null, authenticated: false },
        { status: 200 }
      );
    }
    
    // User is authenticated
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      authenticated: true,
    });
  } catch (error) {
    console.error('Session check error:', error);
    
    return NextResponse.json(
      { user: null, authenticated: false, error: 'Failed to check session' },
      { status: 500 }
    );
  }
}

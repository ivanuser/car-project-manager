/**
 * refresh/route.ts - API endpoint for refreshing authentication token
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService, authMiddleware } from '@/lib/auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Get refresh token from cookies
    const refreshToken = authMiddleware.getRefreshToken(req);
    
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Refresh token not found' },
        { status: 401 }
      );
    }
    
    // Refresh authentication
    const result = await authService.refreshAuth(refreshToken);
    
    // Set new auth cookies
    const response = NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        isAdmin: result.user.isAdmin,
      },
      message: 'Token refreshed successfully',
    });
    
    return authMiddleware.setAuthCookies(
      response,
      result.token,
      result.refreshToken
    );
  } catch (error: any) {
    console.error('Token refresh error:', error);
    
    // Clear cookies on error
    const response = NextResponse.json(
      { error: 'Failed to refresh token' },
      { status: 401 }
    );
    
    return authMiddleware.clearAuthCookies(response);
  }
}

/**
 * Token Refresh API route - /api/auth/refresh
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import middlewareUtils from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    // Get refresh token from cookies
    const refreshToken = middlewareUtils.getRefreshToken(req);
    
    // If no refresh token, return error
    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token provided' },
        { status: 401 }
      );
    }
    
    // Attempt to refresh the token
    const authResult = await authService.refreshAuth(refreshToken);
    
    // Create response
    const response = NextResponse.json(
      { 
        user: authResult.user,
        message: 'Token refreshed successfully'
      },
      { status: 200 }
    );
    
    // Set new authentication cookies
    middlewareUtils.setAuthCookies(
      response,
      authResult.token,
      authResult.refreshToken
    );
    
    return response;
  } catch (error: any) {
    console.error('Token refresh error:', error);
    
    // Create response with error
    const response = NextResponse.json(
      { error: error.message || 'Token refresh failed' },
      { status: 401 }
    );
    
    // Clear cookies on error
    middlewareUtils.clearAuthCookies(response);
    
    return response;
  }
}

export async function GET(req: NextRequest) {
  // For handling redirect from middleware when token expires
  return POST(req);
}

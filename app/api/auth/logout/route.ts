/**
 * Logout API route - /api/auth/logout
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import middlewareUtils from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    // Get token from cookies or headers
    const token = middlewareUtils.getToken(req);
    
    // If no token, just return success (already logged out)
    if (!token) {
      return NextResponse.json(
        { 
          success: true,
          message: 'Already logged out',
          redirectUrl: '/login'
        },
        { status: 200 }
      );
    }
    
    // Invalidate session in database
    await authService.logoutUser(token);
    
    // Create response
    const response = NextResponse.json(
      { 
        success: true,
        message: 'Logout successful',
        redirectUrl: '/login' 
      },
      { status: 200 }
    );
    
    // Clear authentication cookies
    middlewareUtils.clearAuthCookies(response);
    
    return response;
  } catch (error: any) {
    console.error('Logout error:', error);
    
    // Create response with error
    const response = NextResponse.json(
      { 
        success: false,
        error: error.message || 'Logout failed',
        redirectUrl: '/login'
      },
      { status: 500 }
    );
    
    // Still clear cookies even if database operation fails
    middlewareUtils.clearAuthCookies(response);
    
    return response;
  }
}

/**
 * Logout API route - /api/auth/logout
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import middlewareUtils from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
  try {
    console.log('Logout API: Processing logout request');
    
    // Get token from cookies
    const token = middlewareUtils.getToken(req);
    
    if (token) {
      // Logout user (invalidate session)
      await authService.logoutUser(token);
      console.log('Logout API: Session invalidated');
    }
    
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
    
    console.log('Logout API: Cookies cleared');
    
    return response;
  } catch (error: any) {
    console.error('Logout API: Error', error);
    
    // Still clear cookies even if there's an error
    const response = NextResponse.json(
      { 
        success: false,
        error: error.message || 'Logout failed',
        redirectUrl: '/login'
      },
      { status: 500 }
    );
    
    middlewareUtils.clearAuthCookies(response);
    
    return response;
  }
}

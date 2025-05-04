/**
 * logout/route.ts - API endpoint for user logout
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService, authMiddleware } from '@/lib/auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Get token from cookies or headers
    const token = authMiddleware.getToken(req);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Logout user
    await authService.logoutUser(token);
    
    // Clear auth cookies
    const response = NextResponse.json({
      message: 'Logout successful',
    });
    
    return authMiddleware.clearAuthCookies(response);
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, clear cookies
    const response = NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
    
    return authMiddleware.clearAuthCookies(response);
  }
}

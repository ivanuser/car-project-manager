/**
 * Production Logout API Route
 */
import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/production-auth-service';

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      // Invalidate session in database
      await authService.logoutUser(token);
    }
    
    // Create response and clear cookie
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    response.cookies.delete('auth-token');
    
    return response;
    
  } catch (error: any) {
    console.error('Logout API error:', error);
    
    // Still clear the cookie even if there's an error
    const response = NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    );
    
    response.cookies.delete('auth-token');
    return response;
  }
}
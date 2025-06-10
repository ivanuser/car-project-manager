/**
 * Production User Info API Route
 */
import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/production-auth-service';

export async function GET(request: NextRequest) {
  try {
    // Get token from cookie
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Validate session
    const user = await authService.validateSession(token);
    
    if (!user) {
      // Invalid session, clear cookie
      const response = NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
      
      response.cookies.delete('auth-token');
      return response;
    }
    
    return NextResponse.json({
      success: true,
      user
    });
    
  } catch (error: any) {
    console.error('User info API error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get user info' },
      { status: 500 }
    );
  }
}
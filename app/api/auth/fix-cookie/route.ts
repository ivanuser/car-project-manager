/**
 * Fix Authentication Cookie for Remote Dev
 */
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwtUtils from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  console.log('🔧 Fix auth cookie called');
  
  try {
    // Get current auth token
    const cookieStore = cookies();
    const currentToken = cookieStore.get('auth-token')?.value;
    
    console.log('🎩 Current token exists:', !!currentToken);
    
    if (!currentToken) {
      return NextResponse.json(
        { error: 'No authentication token found' },
        { status: 401 }
      );
    }
    
    // Verify the token is still valid
    const payload = jwtUtils.verifyToken(currentToken);
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      );
    }
    
    console.log('✅ Token verified for user:', payload.sub);
    
    // Create response
    const response = NextResponse.json({
      success: true,
      message: 'Authentication cookie fixed for remote dev',
      userId: payload.sub
    });
    
    // Set cookie with proper settings for remote dev
    const cookieOptions: any = {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
      secure: false // Disable secure for dev
    };
    
    // Set domain for dev environment
    if (request.headers.get('host')?.includes('customautojourney.com')) {
      cookieOptions.domain = '.customautojourney.com';
    }
    
    console.log('🍪 Setting fixed cookie with options:', cookieOptions);
    response.cookies.set('auth-token', currentToken, cookieOptions);
    
    return response;
    
  } catch (error: any) {
    console.error('Fix auth cookie error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fix auth cookie' },
      { status: 500 }
    );
  }
}

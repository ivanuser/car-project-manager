/**
 * Production Login API Route
 */
import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/production-auth-service';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Attempt login
    const authResult = await authService.loginUser(email, password);
    
    // Create response
    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      message: 'Login successful'
    });
    
    // Set secure HTTP-only cookie with proper domain settings for remote dev
    const cookieOptions: any = {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    };
    
    // Handle different environments
    if (process.env.NODE_ENV === 'production') {
      cookieOptions.secure = true;
    } else {
      // For development with custom domain
      cookieOptions.secure = false;
      // Allow cookie for dev domain
      if (request.headers.get('host')?.includes('customautojourney.com')) {
        cookieOptions.domain = '.customautojourney.com';
      }
    }
    
    console.log('🍪 Setting auth-token cookie with options:', cookieOptions);
    response.cookies.set('auth-token', authResult.token, cookieOptions);
    
    return response;
    
  } catch (error: any) {
    console.error('Login API error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}
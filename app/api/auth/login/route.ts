/**
 * login/route.ts - API endpoint for user login
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService, authMiddleware } from '@/lib/auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    
    // Validate request body
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    
    // Login user
    const result = await authService.loginUser({
      email: body.email,
      password: body.password,
    });
    
    // Set auth cookies
    const response = NextResponse.json({
      user: {
        id: result.user.id,
        email: result.user.email,
        isAdmin: result.user.isAdmin,
      },
      message: 'Login successful',
    });
    
    return authMiddleware.setAuthCookies(
      response,
      result.token,
      result.refreshToken
    );
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle known errors
    if (error.message === 'Invalid email or password') {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}

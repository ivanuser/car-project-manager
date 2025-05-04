/**
 * register/route.ts - API endpoint for user registration
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService, authMiddleware } from '@/lib/auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    
    // Validate request body
    if (!body.email || !body.password || !body.confirmPassword) {
      return NextResponse.json(
        { error: 'Email, password, and confirmPassword are required' },
        { status: 400 }
      );
    }
    
    if (body.password !== body.confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }
    
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Register user
    const result = await authService.registerUser({
      email: body.email,
      password: body.password,
      confirmPassword: body.confirmPassword,
    });
    
    // Set auth cookies
    const response = NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          isAdmin: result.user.isAdmin,
        },
        message: 'Registration successful',
      },
      { status: 201 }
    );
    
    return authMiddleware.setAuthCookies(
      response,
      result.token,
      result.refreshToken
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle known errors
    if (error.message === 'User with this email already exists') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}

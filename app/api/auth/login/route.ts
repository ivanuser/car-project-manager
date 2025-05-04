/**
 * login/route.ts - API endpoint for user login
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerAuth, setAuthCookies, createErrorResponse } from '@/lib/auth/api-helpers';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Safely import server-side auth modules
    const { authService } = await getServerAuth();
    
    const body = await req.json();
    
    // Validate request body
    if (!body.email || !body.password) {
      return createErrorResponse('Email and password are required', 400);
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
    
    return setAuthCookies(
      response,
      result.token,
      result.refreshToken
    );
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle known errors
    if (error.message === 'Invalid email or password') {
      return createErrorResponse('Invalid email or password', 401);
    }
    
    return createErrorResponse('Login failed', 500);
  }
}

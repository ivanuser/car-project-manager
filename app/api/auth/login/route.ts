/**
 * Login API route - /api/auth/login
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import middlewareUtils from '@/lib/auth/middleware';
import { z } from 'zod';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate request
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Attempt login
    const { email, password } = validationResult.data;
    const authResult = await authService.loginUser({ email, password });
    
    // Create response
    const response = NextResponse.json(
      { 
        user: authResult.user,
        message: 'Login successful'
      },
      { status: 200 }
    );
    
    // Set authentication cookies
    middlewareUtils.setAuthCookies(
      response,
      authResult.token,
      authResult.refreshToken
    );
    
    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    
    // Return appropriate error message
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}

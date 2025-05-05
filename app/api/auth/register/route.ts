/**
 * Register API route - /api/auth/register
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import middlewareUtils from '@/lib/auth/middleware';
import { z } from 'zod';

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate request
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Attempt registration
    const registrationData = validationResult.data;
    const authResult = await authService.registerUser(registrationData);
    
    // Create response
    const response = NextResponse.json(
      { 
        user: authResult.user,
        message: 'Registration successful'
      },
      { status: 201 }
    );
    
    // Set authentication cookies
    middlewareUtils.setAuthCookies(
      response,
      authResult.token,
      authResult.refreshToken
    );
    
    return response;
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Check if it's a duplicate email error
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Return appropriate error message
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 400 }
    );
  }
}

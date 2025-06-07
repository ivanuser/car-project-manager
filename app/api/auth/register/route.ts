/**
 * Register API route - /api/auth/register (Fixed)
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
    console.log('Register API: Processing registration request');
    
    // Parse request body
    const body = await req.json();
    console.log('Register API: Request body parsed', { email: body.email });
    
    // Validate request
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Register API: Validation failed', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Attempt registration
    const registrationData = validationResult.data;
    console.log('Register API: Attempting registration for', registrationData.email);
    
    const authResult = await authService.registerUser(registrationData);
    console.log('Register API: Registration successful for', registrationData.email);
    
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
    
    console.log('Register API: Auth cookies set');
    
    return response;
  } catch (error: any) {
    console.error('Register API: Error', error);
    
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

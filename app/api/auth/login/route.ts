/**
 * Login API route - /api/auth/login (Fixed)
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import middlewareUtils from '@/lib/auth/middleware';
import { z } from 'zod';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(req: NextRequest) {
  try {
    console.log('Login API: Processing login request');
    
    // Parse request body
    const body = await req.json();
    console.log('Login API: Request body parsed', { email: body.email });
    
    // Validate request
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      console.log('Login API: Validation failed', validationResult.error.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Attempt login
    const { email, password } = validationResult.data;
    console.log('Login API: Attempting login for', email);
    
    const authResult = await authService.loginUser({ email, password });
    console.log('Login API: Login successful for', email);
    
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
    
    console.log('Login API: Auth cookies set');
    
    return response;
  } catch (error: any) {
    console.error('Login API: Error', error);
    
    // Return appropriate error message
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 401 }
    );
  }
}

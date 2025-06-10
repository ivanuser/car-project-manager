/**
 * Password Reset API route - /api/auth/password-reset/reset
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { z } from 'zod';

// Validation schema for password reset
const resetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
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
    const validationResult = resetSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Reset password
    const { token, password } = validationResult.data;
    const success = await authService.resetPassword(token, password);
    
    if (success) {
      return NextResponse.json(
        { message: 'Password reset successful' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Password reset error:', error);
    
    // Return appropriate error message
    if (error.message.includes('Invalid reset token')) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Password reset failed' },
      { status: 400 }
    );
  }
}

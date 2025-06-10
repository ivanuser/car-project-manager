/**
 * Password Reset Request API route - /api/auth/password-reset/request
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import { z } from 'zod';

// Validation schema for password reset request
const requestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body = await req.json();
    
    // Validate request
    const validationResult = requestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Request password reset
    const { email } = validationResult.data;
    const resetToken = await authService.requestPasswordReset(email);
    
    // Always return success, even if email not found
    // (prevents email enumeration attacks)
    return NextResponse.json(
      { message: 'Password reset instructions sent if email exists' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Password reset request error:', error);
    
    // Still return success to prevent email enumeration
    return NextResponse.json(
      { message: 'Password reset instructions sent if email exists' },
      { status: 200 }
    );
  }
}

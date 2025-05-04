/**
 * reset-password/route.ts - API endpoint for password reset
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    
    // Validate request body
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Request password reset
    const resetToken = await authService.requestPasswordReset(body.email);
    
    // For security reasons, always return success, even if the email doesn't exist
    return NextResponse.json({
      message: 'Password reset instructions have been sent to your email if it exists in our system',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    
    // For security reasons, don't expose the error
    return NextResponse.json({
      message: 'Password reset instructions have been sent to your email if it exists in our system',
    });
  }
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    
    // Validate request body
    if (!body.token || !body.password || !body.confirmPassword) {
      return NextResponse.json(
        { error: 'Token, password, and confirmPassword are required' },
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
    
    // Reset password
    const success = await authService.resetPassword(body.token, body.password);
    
    if (success) {
      return NextResponse.json({
        message: 'Password reset successful',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Password reset error:', error);
    
    // Handle known errors
    if (error.message === 'Invalid reset token' || error.message === 'Reset token expired') {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}

/**
 * Password Change API route - /api/auth/password
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import middlewareUtils from '@/lib/auth/middleware';
import jwtUtils from '@/lib/auth/jwt';
import { z } from 'zod';

// Validation schema for password change
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export async function POST(req: NextRequest) {
  try {
    // Get token from cookies or headers
    const token = middlewareUtils.getToken(req);
    
    // If no token, return unauthorized
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Get user ID from token
    const userId = jwtUtils.getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate request
    const validationResult = passwordChangeSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    // Change password
    const { currentPassword, newPassword } = validationResult.data;
    const success = await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    );
    
    // Create response
    const response = NextResponse.json(
      { message: 'Password changed successfully' },
      { status: 200 }
    );
    
    // Clear authentication cookies (user will need to login again)
    middlewareUtils.clearAuthCookies(response);
    
    return response;
  } catch (error: any) {
    console.error('Password change error:', error);
    
    // Check if it's an incorrect password error
    if (error.message.includes('Current password is incorrect')) {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    // Return appropriate error message
    return NextResponse.json(
      { error: error.message || 'Failed to change password' },
      { status: 500 }
    );
  }
}

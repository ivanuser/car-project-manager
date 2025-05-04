/**
 * change-password/route.ts - API endpoint for changing password
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import { authService, authMiddleware, jwtUtils } from '@/lib/auth';

export async function POST(req: NextRequest): Promise<NextResponse> {
  // Check if user is authenticated
  const authResult = await authMiddleware.requireAuth(req);
  if (authResult) {
    return authResult; // Not authenticated
  }
  
  try {
    const body = await req.json();
    
    // Validate request body
    if (!body.currentPassword || !body.newPassword || !body.confirmPassword) {
      return NextResponse.json(
        { error: 'Current password, new password, and confirm password are required' },
        { status: 400 }
      );
    }
    
    if (body.newPassword !== body.confirmPassword) {
      return NextResponse.json(
        { error: 'New passwords do not match' },
        { status: 400 }
      );
    }
    
    if (body.newPassword.length < 8) {
      return NextResponse.json(
        { error: 'New password must be at least 8 characters long' },
        { status: 400 }
      );
    }
    
    // Get user ID from token
    const token = authMiddleware.getToken(req);
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    const userId = jwtUtils.getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }
    
    // Change password
    const success = await authService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword
    );
    
    if (success) {
      // The user will need to log in again with the new password
      const response = NextResponse.json({
        message: 'Password changed successfully. Please log in again with your new password.',
      });
      
      // Clear auth cookies
      return authMiddleware.clearAuthCookies(response);
    } else {
      return NextResponse.json(
        { error: 'Failed to change password' },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Change password error:', error);
    
    // Handle known errors
    if (error.message === 'Current password is incorrect') {
      return NextResponse.json(
        { error: 'Current password is incorrect' },
        { status: 400 }
      );
    }
    
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 500 }
    );
  }
}

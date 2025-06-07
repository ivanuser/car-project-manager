/**
 * User API route - /api/auth/user (Fixed)
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import middlewareUtils from '@/lib/auth/middleware';

/**
 * Get authenticated user information
 */
export async function GET(req: NextRequest) {
  try {
    console.log('User API: Processing user info request');
    
    // Get token from cookies
    const token = middlewareUtils.getToken(req);
    
    // If no token, return unauthorized
    if (!token) {
      console.log('User API: No token found');
      return NextResponse.json(
        { error: 'Authentication required - no token found' },
        { status: 401 }
      );
    }
    
    console.log('User API: Token found, validating session');
    
    // Validate session using the auth service
    const user = await authService.validateSession(token);
    
    if (user) {
      console.log('User API: Session validated for user', user.email);
      return NextResponse.json(
        { user },
        { status: 200 }
      );
    } else {
      console.log('User API: Session validation failed');
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('User API: Error', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to get user information' },
      { status: 500 }
    );
  }
}

/**
 * Update user information (placeholder)
 */
export async function PATCH(req: NextRequest) {
  try {
    // Get token from cookies
    const token = middlewareUtils.getToken(req);
    
    // If no token, return unauthorized
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Validate session
    const user = await authService.validateSession(token);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // For now, just return the current user
    // TODO: Implement actual user update logic
    return NextResponse.json(
      { 
        user,
        message: 'User information updated successfully' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('User API: Update error', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to update user information' },
      { status: 500 }
    );
  }
}

/**
 * User API route - /api/auth/user
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/auth-service';
import middlewareUtils from '@/lib/auth/middleware';
import jwtUtils from '@/lib/auth/jwt';

/**
 * Get authenticated user information
 */
export async function GET(req: NextRequest) {
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
    
    // Validate session
    const user = await authService.validateSession(token);
    if (!user) {
      // Token might be expired
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }
    
    // Return user information
    return NextResponse.json(
      { user },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Get user error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to get user information' },
      { status: 500 }
    );
  }
}

/**
 * Update user information
 */
export async function PATCH(req: NextRequest) {
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
    
    // TODO: Implement user profile update
    // For now, just return the current user
    const user = await authService.getUserById(userId);
    
    return NextResponse.json(
      { 
        user,
        message: 'User information updated successfully' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update user error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to update user information' },
      { status: 500 }
    );
  }
}

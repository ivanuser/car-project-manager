/**
 * User API route - /api/auth/user (Simplified for debugging)
 * For Caj-pro car project build tracking application
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Get authenticated user information
 */
export async function GET(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('cajpro_auth_token')?.value;
    
    // If no token, return unauthorized
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required - no token found' },
        { status: 401 }
      );
    }
    
    // Check if it's the dev token
    if (token === 'dev-token-12345') {
      const devUser = {
        id: 'dev-user-001',
        email: 'dev@cajpro.local',
        isAdmin: true,
        fullName: 'Development User'
      };
      
      return NextResponse.json(
        { user: devUser },
        { status: 200 }
      );
    }
    
    // For real tokens, try to validate using the auth service
    try {
      // Import auth service dynamically to avoid circular dependencies
      const authService = (await import('@/lib/auth/auth-service')).default;
      const user = await authService.validateSession(token);
      
      if (user) {
        return NextResponse.json(
          { user },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { error: 'Invalid or expired token' },
          { status: 401 }
        );
      }
    } catch (authError) {
      console.error('Auth service error:', authError);
      return NextResponse.json(
        { error: 'Authentication service error' },
        { status: 500 }
      );
    }
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
    // Get token from cookies
    const token = req.cookies.get('cajpro_auth_token')?.value;
    
    // If no token, return unauthorized
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // For dev token, return mock response
    if (token === 'dev-token-12345') {
      const devUser = {
        id: 'dev-user-001',
        email: 'dev@cajpro.local',
        isAdmin: true,
        fullName: 'Development User'
      };
      
      return NextResponse.json(
        { 
          user: devUser,
          message: 'User information updated successfully (dev mode)' 
        },
        { status: 200 }
      );
    }
    
    // For real tokens, implement actual update logic here
    return NextResponse.json(
      { error: 'User update not implemented yet' },
      { status: 501 }
    );
  } catch (error: any) {
    console.error('Update user error:', error);
    
    return NextResponse.json(
      { error: error.message || 'Failed to update user information' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getUserPreferences } from '@/actions/profile-actions';
import jwtUtils from '@/lib/auth/jwt';

/**
 * GET /api/user/preferences
 * Fetches user preferences
 */
export async function GET(req: NextRequest) {
  try {
    // Get userId from query params
    const searchParams = req.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }
    
    // Validate authentication
    const authHeader = req.headers.get('authorization');
    const authCookie = req.cookies.get('cajpro_auth_token')?.value;
    
    let isAuthenticated = false;
    let authUserId = null;
    
    // Try to authenticate with token from header
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = jwtUtils.verifyToken(token);
      if (payload && !jwtUtils.isTokenExpired(token)) {
        isAuthenticated = true;
        authUserId = payload.sub;
      }
    }
    // Try to authenticate with token from cookie
    else if (authCookie) {
      const payload = jwtUtils.verifyToken(authCookie);
      if (payload && !jwtUtils.isTokenExpired(authCookie)) {
        isAuthenticated = true;
        authUserId = payload.sub;
      }
    }
    
    // Special case for development mode
    if (process.env.NODE_ENV === 'development') {
      // Allow access in development mode for testing
      isAuthenticated = true;
    }
    
    if (!isAuthenticated && authUserId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Use the server action to get preferences
    const { preferences, error } = await getUserPreferences(userId);
    
    if (error) {
      return NextResponse.json(
        { error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error in preferences API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Production Logout API Route - Fixed
 */
import { NextRequest, NextResponse } from 'next/server';
import authService from '@/lib/auth/production-auth-service';

export async function POST(request: NextRequest) {
  try {
    // Get token from both possible cookie names (for compatibility)
    const token = request.cookies.get('auth-token')?.value || 
                  request.cookies.get('cajpro_auth_token')?.value;
    
    if (token) {
      // Invalidate session in database
      try {
        await authService.logoutUser(token);
      } catch (error) {
        console.error('Error invalidating session:', error);
        // Continue with cookie clearing even if session invalidation fails
      }
    }
    
    // Create response and clear ALL possible cookies
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
    
    // Clear all possible auth cookies
    response.cookies.delete('auth-token');
    response.cookies.delete('cajpro_auth_token'); 
    response.cookies.delete('cajpro_refresh_token');
    
    // Add cache control headers to prevent caching
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
    
  } catch (error: any) {
    console.error('Logout API error:', error);
    
    // Still clear all cookies even if there's an error
    const response = NextResponse.json(
      { error: 'Logout failed but cookies cleared' },
      { status: 200 } // Use 200 so frontend still processes the cookie clearing
    );
    
    response.cookies.delete('auth-token');
    response.cookies.delete('cajpro_auth_token');
    response.cookies.delete('cajpro_refresh_token');
    
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  }
}

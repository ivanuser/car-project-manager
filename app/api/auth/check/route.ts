// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { checkAuthStatus } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    // Get cookies from request
    const cookies = request.cookies;
    const authCookie = cookies.get('cajpro_auth_token');
    
    console.log('Auth check API called');
    console.log('Auth cookie present:', !!authCookie);
    console.log('Auth cookie value:', authCookie ? 'Present (hidden)' : 'Not found');
    
    // Try to check auth status
    // Note: checkAuthStatus is a client-side function, so we'll simulate server-side check
    if (!authCookie) {
      return NextResponse.json({
        authenticated: false,
        reason: 'No auth cookie found',
        cookies: Array.from(cookies.getAll().map(c => `${c.name}=${c.value.substring(0, 10)}...`))
      });
    }
    
    // Here we could verify the JWT token server-side
    // For now, just return that we found a cookie
    return NextResponse.json({
      authenticated: true,
      reason: 'Auth cookie found',
      cookieName: authCookie.name,
      cookieExists: true
    });
    
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
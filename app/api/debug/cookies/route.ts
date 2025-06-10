import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  console.log('🍪 Cookie debug endpoint called');
  
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    const requestCookieHeader = request.headers.get('cookie')
    
    console.log('📋 All cookies from store:', allCookies);
    console.log('📋 Raw cookie header:', requestCookieHeader);
    
    return NextResponse.json({
      success: true,
      cookieStore: allCookies,
      rawCookieHeader: requestCookieHeader,
      authToken: cookieStore.get('auth-token')?.value || null,
      host: request.headers.get('host'),
      userAgent: request.headers.get('user-agent')
    })
    
  } catch (error: any) {
    console.error('Cookie debug error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}

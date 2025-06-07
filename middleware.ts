/**
 * middleware.ts - Simplified Next.js middleware for authentication
 * Emergency version to resolve redirect loops
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    // Skip middleware completely for these routes
    if (
      req.nextUrl.pathname.startsWith('/api/') ||
      req.nextUrl.pathname.startsWith('/direct-dashboard') ||
      req.nextUrl.pathname.startsWith('/auth-debug') ||
      req.nextUrl.pathname.startsWith('/test-login') ||
      req.nextUrl.pathname.startsWith('/_next/') ||
      req.nextUrl.pathname.startsWith('/favicon.ico') ||
      req.nextUrl.pathname === '/login' ||
      req.nextUrl.pathname === '/register'
    ) {
      return NextResponse.next();
    }
    
    // Only protect /dashboard/* routes (not the root dashboard)
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      const authToken = req.cookies.get('cajpro_auth_token')?.value;
      
      // If no token, redirect to login
      if (!authToken) {
        console.log("[Middleware] No auth token, redirecting to login");
        const url = new URL('/login', req.url);
        return NextResponse.redirect(url);
      }
      
      // If token exists (either real or dev), allow access
      console.log("[Middleware] Auth token found, allowing access");
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Only match dashboard routes and auth routes
    '/dashboard/:path*',
  ],
};

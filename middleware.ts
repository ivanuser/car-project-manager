/**
 * middleware.ts - Next.js middleware for authentication (Production Ready)
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  try {
    console.log(`[Middleware] Processing: ${req.nextUrl.pathname}`);
    
    // Skip middleware for API routes and static files
    if (
      req.nextUrl.pathname.startsWith('/api/') ||
      req.nextUrl.pathname.startsWith('/_next/') ||
      req.nextUrl.pathname.startsWith('/favicon.ico') ||
      req.nextUrl.pathname.startsWith('/public/')
    ) {
      return NextResponse.next();
    }
    
    // Get auth token from cookies
    const authToken = req.cookies.get('cajpro_auth_token')?.value;
    
    // Define route types
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
    const isAuthRoute = (
      req.nextUrl.pathname === "/login" || 
      req.nextUrl.pathname === "/register" || 
      req.nextUrl.pathname === "/forgot-password" ||
      req.nextUrl.pathname === "/reset-password"
    );
    
    // Redirect logic
    if (isProtectedRoute && !authToken) {
      console.log(`[Middleware] No auth token for protected route, redirecting to login`);
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    if (isAuthRoute && authToken) {
      console.log(`[Middleware] User already authenticated, redirecting to dashboard`);
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    console.log(`[Middleware] Allowing access to: ${req.nextUrl.pathname}`);
    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all routes except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};

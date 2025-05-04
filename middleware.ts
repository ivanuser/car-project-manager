/**
 * middleware.ts - Next.js middleware for authentication
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtUtils } from "./lib/auth";

// Authentication middleware
export async function middleware(req: NextRequest) {
  try {
    // Skip middleware for API routes (handled by route handlers)
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
    
    console.log(`[Middleware] Processing: ${req.nextUrl.pathname}`);
    
    // Get auth token from cookies
    const authToken = req.cookies.get('cajpro_auth_token')?.value;
    console.log(`[Middleware] Auth token present: ${!!authToken}`);
    
    // Get refresh token
    const refreshToken = req.cookies.get('cajpro_refresh_token')?.value;
    
    // Only protect dashboard routes
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
    const isAuthRoute = (
      req.nextUrl.pathname === "/login" || 
      req.nextUrl.pathname === "/register" || 
      req.nextUrl.pathname === "/forgot-password" ||
      req.nextUrl.pathname === "/reset-password"
    );
    
    // Check if token is valid (if present)
    let isValidToken = false;
    if (authToken) {
      const decoded = jwtUtils.verifyToken(authToken);
      isValidToken = !!decoded && !jwtUtils.isTokenExpired(authToken);
      console.log(`[Middleware] Token valid: ${isValidToken}`);
    }
    
    // Redirect logic
    if (isProtectedRoute && (!authToken || !isValidToken)) {
      // If user is trying to access protected route but is not authenticated
      console.log("[Middleware] User is not authenticated, redirecting to login");
      
      // Keep the original URL to redirect back after login
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', req.nextUrl.pathname);
      
      return NextResponse.redirect(url);
    }
    
    if (isAuthRoute && authToken && isValidToken) {
      // If user is already authenticated and trying to access auth routes
      console.log("[Middleware] User is already authenticated, redirecting to dashboard");
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    // Client-side token refresh will handle expired tokens via our API endpoints
    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Match all routes except static files, api routes, and public assets
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
};

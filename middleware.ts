import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simplified middleware that only redirects unauthenticated users from protected routes
export async function middleware(req: NextRequest) {
  try {
    // Skip middleware for API routes (to avoid interference with API handlers)
    if (req.nextUrl.pathname.startsWith('/api/')) {
      return NextResponse.next();
    }
    
    console.log(`[Middleware] Processing: ${req.nextUrl.pathname}`);
    
    // Basic auth check
    const hasAuthCookie = req.cookies.has('sb-dqapklpzcfosobremzfc-auth-token');
    console.log(`[Middleware] Auth cookie present: ${hasAuthCookie}`);
    
    // Only protect dashboard routes - do not redirect away from login pages
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
    
    if (!hasAuthCookie && isProtectedRoute) {
      // Redirect unauthenticated users from protected routes to login
      console.log("[Middleware] User is not authenticated, redirecting to login");
      return NextResponse.redirect(new URL('/login', req.url));
    }
    
    // Allow all other routes to proceed normally - including login pages
    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

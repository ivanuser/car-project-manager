import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Improved middleware with minimal authentication checking
export async function middleware(req: NextRequest) {
  try {
    console.log(`[Middleware] Processing: ${req.nextUrl.pathname}`);
    
    // For the dashboard route conflict - special handling
    if (req.nextUrl.pathname === "/dashboard" || 
        req.nextUrl.pathname === "/dashboard/" || 
        req.nextUrl.pathname.startsWith("/dashboard/")) {
      
      // Redirect to our fixed dashboard view
      console.log("[Middleware] Redirecting dashboard to fixed view");
      const fixedUrl = new URL("/dashboard-view", req.url);
      return NextResponse.redirect(fixedUrl);
    }
    
    // Basic auth check
    const hasAuthCookie = req.cookies.has('sb-dqapklpzcfosobremzfc-auth-token');
    
    // Handle auth redirects
    const isProtectedRoute = (
      req.nextUrl.pathname.startsWith("/dashboard") || 
      req.nextUrl.pathname.startsWith("/dashboard-view")
    );
    
    const isAuthRoute = req.nextUrl.pathname === '/login' || 
                       req.nextUrl.pathname === '/register' || 
                       req.nextUrl.pathname.startsWith("/auth");
    
    if (!hasAuthCookie && isProtectedRoute) {
      console.log("[Middleware] No auth cookie, redirecting to login");
      const redirectUrl = new URL('/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (hasAuthCookie && isAuthRoute && req.nextUrl.pathname !== '/') {
      console.log("[Middleware] Auth cookie found, redirecting to dashboard-view");
      const redirectUrl = new URL('/dashboard-view', req.url);
      return NextResponse.redirect(redirectUrl);
    }
    
    // Default handling
    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

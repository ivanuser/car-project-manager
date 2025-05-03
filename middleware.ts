import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Improved middleware with minimal authentication checking
export async function middleware(req: NextRequest) {
  try {
    // For the dashboard route.ts conflict - special handling
    if (req.nextUrl.pathname === "/dashboard" && req.method === "GET") {
      // Force Next.js to use the page component instead of route.ts
      // by slightly modifying the URL to /dashboard/
      const url = req.nextUrl.clone();
      url.pathname = "/dashboard/";
      return NextResponse.rewrite(url);
    }
    
    // Basic auth check to enable protected routes
    const hasAuthCookie = req.cookies.has('sb-dqapklpzcfosobremzfc-auth-token');
    
    // Handle auth redirects
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
    const isAuthRoute = req.nextUrl.pathname === '/login' || 
                       req.nextUrl.pathname === '/register' || 
                       req.nextUrl.pathname.startsWith("/auth");
    
    if (!hasAuthCookie && isProtectedRoute) {
      console.log("[Middleware] No auth cookie, redirecting to login");
      const redirectUrl = new URL('/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (hasAuthCookie && isAuthRoute && req.nextUrl.pathname !== '/') {
      console.log("[Middleware] Auth cookie found, redirecting to dashboard");
      const redirectUrl = new URL('/dashboard', req.url);
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

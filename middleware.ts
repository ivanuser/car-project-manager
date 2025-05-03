import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Extremely simplified middleware that doesn't use Supabase client
export async function middleware(req: NextRequest) {
  // Bypass middleware for all routes for now, to fix the infinite loop
  return NextResponse.next();
  
  /* We'll comment out all of this code to stop the infinite loops
  
  try {
    console.log(`[Middleware] Processing: ${req.nextUrl.pathname}`);
    
    // Basic auth check based on cookie existence only, no Supabase client
    const hasAuthCookie = req.cookies.has('sb-dqapklpzcfosobremzfc-auth-token');
    
    // Handle redirects based on simple cookie check
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
    const isAuthRoute = req.nextUrl.pathname === '/login' || 
                       req.nextUrl.pathname === '/register' || 
                       req.nextUrl.pathname.startsWith("/auth");
    
    if (!hasAuthCookie && isProtectedRoute) {
      console.log("[Middleware] No auth cookie, redirecting to login");
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (hasAuthCookie && isAuthRoute && req.nextUrl.pathname !== '/') {
      console.log("[Middleware] Auth cookie found, redirecting to dashboard");
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Error:", error);
    return NextResponse.next();
  }
  */
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

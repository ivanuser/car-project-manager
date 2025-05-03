import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  try {
    // Only log the path, not every cookie operation
    console.log(`[Middleware] Processing: ${req.nextUrl.pathname}`);
    
    // Create response
    const res = NextResponse.next();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Skipping auth middleware due to missing Supabase configuration");
      return res;
    }

    // Create Supabase client with minimal cookie operations logging
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            // Don't log every cookie retrieval
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // Only set cookies, don't remove them in middleware
            res.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            // *** CRITICAL: Don't remove cookies in middleware to prevent infinite loops ***
            // Instead, just log that a removal was attempted but not executed
            console.log(`[Middleware] Cookie removal prevented for: ${name} to avoid infinite loops`);
          },
        },
      }
    );

    // Get session but don't manipulate cookies
    const { data: { session } } = await supabase.auth.getSession();
    
    // Simple authentication checks without manipulating cookies
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
    const isAuthRoute = req.nextUrl.pathname === '/login' || 
                       req.nextUrl.pathname === '/register' || 
                       req.nextUrl.pathname.startsWith("/auth");

    // Handle redirects based on auth state
    if (!session && isProtectedRoute) {
      console.log("[Middleware] No session, redirecting to login");
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (session && isAuthRoute && req.nextUrl.pathname !== '/') {
      console.log("[Middleware] Session found, redirecting to dashboard");
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return res;
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

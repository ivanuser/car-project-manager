import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr"; // <-- Use @supabase/ssr

export async function middleware(req: NextRequest) {
  try {
    console.log(`[Middleware] Processing request for: ${req.nextUrl.pathname}`);
    let response = NextResponse.next({
      request: {
        headers: req.headers,
      },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Skipping auth middleware due to missing Supabase configuration");
      return response;
    }

    // Create Supabase client configured for middleware
    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // If the cookie is set, update the request and response cookies.
            req.cookies.set({ name, value, ...options });
            response = NextResponse.next({
              request: { headers: req.headers },
            });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            // If the cookie is removed, update the request and response cookies.
            req.cookies.set({ name, value: "", ...options });
            response = NextResponse.next({
              request: { headers: req.headers },
            });
            response.cookies.set({ name, value: "", ...options });
          },
        },
      }
    );

    // IMPORTANT: Refresh session so it doesn't expire
    // This will also handle reading the session from cookies
    const { data: { session }, } = await supabase.auth.getSession();

    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
    const isPublicRoute = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register' || req.nextUrl.pathname === '/' || req.nextUrl.pathname.startsWith("/auth");

    // --- REMOVED TEMPORARY BYPASS ---
    // console.log(`[Middleware] Path: ${req.nextUrl.pathname}, Bypassing auth check temporarily`)
    // return response; // <-- Removed this line

    // If no session and accessing a protected route, redirect to login
    if (!session && isProtectedRoute) {
       console.log("[Middleware] No session, redirecting to login for protected route:", req.nextUrl.pathname);
       const redirectUrl = req.nextUrl.clone()
       redirectUrl.pathname = '/login'
       redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
       return NextResponse.redirect(redirectUrl)
    }

    // If session exists and accessing a public route (except '/'), redirect to dashboard
    if (session && isPublicRoute && req.nextUrl.pathname !== '/') {
       console.log("[Middleware] Session found, redirecting from public route to dashboard:", req.nextUrl.pathname);
       return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // If no redirects are needed, continue with the response
    return response;

  } catch (error) {
    console.error("[Middleware] Error:", error);
    // If there's an error in the middleware, allow the request to continue but log it
    return NextResponse.next();
  }
}

// Update matcher to cover all paths except API, static assets, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
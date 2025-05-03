import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  try {
    console.log(`[Middleware] Processing request for: ${req.nextUrl.pathname}`);
    // Start with the original request headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-pathname', req.nextUrl.pathname); // Optional: example of passing info via headers

    // Create the initial response based on the incoming request
    let response = NextResponse.next({
      request: {
        headers: requestHeaders,
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
            // Set cookies directly on the response instance
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            // Set cookies directly on the response instance
            response.cookies.set({ name, value: '', ...options });
          },
        },
      }
    );

    // IMPORTANT: Refresh session. This reads cookies via get() and potentially sets new ones via set()/remove()
    const { data: { session }, } = await supabase.auth.getSession();

    // --- Authentication Logic ---
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
    const isPublicRoute = req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/register' || req.nextUrl.pathname === '/' || req.nextUrl.pathname.startsWith("/auth");

    if (!session && isProtectedRoute) {
      console.log("[Middleware] No session, redirecting to login for protected route:", req.nextUrl.pathname);
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
      // Important: Return the redirect response immediately
      return NextResponse.redirect(redirectUrl);
    }

    if (session && isPublicRoute && req.nextUrl.pathname !== '/') {
      console.log("[Middleware] Session found, redirecting from public route to dashboard:", req.nextUrl.pathname);
      // Important: Return the redirect response immediately
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
    // --- End Authentication Logic ---

    // If no redirects are needed, return the potentially modified response (e.g., with refreshed cookies)
    return response;

  } catch (error) {
    console.error("[Middleware] Error:", error);
    // Allow request on error to prevent blocking the site entirely
    return NextResponse.next();
  }
}

// Config remains the same
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
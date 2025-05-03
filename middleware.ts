import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  try {
    console.log(`[Middleware] Processing request for: ${req.nextUrl.pathname}`);
    
    // Create response and get cookies
    const res = NextResponse.next();
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Skipping auth middleware due to missing Supabase configuration");
      return res;
    }

    // Create Supabase client with enhanced error handling
    try {
      const supabase = createServerClient(
        supabaseUrl,
        supabaseAnonKey,
        {
          cookies: {
            get(name: string) {
              console.log(`[Middleware] Retrieving cookie: ${name}`);
              return req.cookies.get(name)?.value;
            },
            set(name: string, value: string, options: CookieOptions) {
              console.log(`[Middleware] Setting cookie: ${name}`);
              res.cookies.set({ name, value, ...options });
            },
            remove(name: string, options: CookieOptions) {
              console.log(`[Middleware] Removing cookie: ${name}`);
              res.cookies.set({ name, value: '', ...options });
            },
          },
        }
      );

      // Refresh session with error handling
      console.log("[Middleware] Getting session");
      const sessionResult = await supabase.auth.getSession();
      if (sessionResult.error) {
        console.error("[Middleware] Session error:", sessionResult.error.message);
      } else {
        console.log("[Middleware] Session found:", !!sessionResult.data.session);
      }
      
      const session = sessionResult.data.session;

      // Authentication Logic
      const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard");
      const isAuthRoute = req.nextUrl.pathname === '/login' || 
                         req.nextUrl.pathname === '/register' || 
                         req.nextUrl.pathname.startsWith("/auth");

      if (!session && isProtectedRoute) {
        console.log("[Middleware] No session, redirecting to login");
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/login';
        redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      if (session && isAuthRoute && req.nextUrl.pathname !== '/') {
        console.log("[Middleware] Session found, redirecting to dashboard");
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    } catch (clientError) {
      console.error("[Middleware] Supabase client error:", clientError);
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

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  try {
    const res = NextResponse.next()

    // Skip auth checks if we're in a development/preview environment without Supabase config
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn("Skipping auth middleware due to missing Supabase configuration")
      return res
    }

    // Skip auth checks for static assets and API routes
    if (
      req.nextUrl.pathname.startsWith("/_next") ||
      req.nextUrl.pathname.startsWith("/api/") ||
      req.nextUrl.pathname.startsWith("/static/") ||
      req.nextUrl.pathname.includes(".")
    ) {
      return res
    }

    // Protected routes that require authentication
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")
    const isAuthRoute = req.nextUrl.pathname.startsWith("/login") || 
                        req.nextUrl.pathname.startsWith("/register") || 
                        req.nextUrl.pathname.startsWith("/auth")
    
    if (isProtectedRoute) {
      console.log(`[Middleware] Checking auth for protected route: ${req.nextUrl.pathname}`)
      
      // Get the session
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error("[Middleware] Auth error:", error)
      }
      
      // If there's no session, redirect to login
      if (!session) {
        console.log("[Middleware] No auth session found, redirecting to login")
        return NextResponse.redirect(new URL("/login", req.url))
      }
      
      console.log(`[Middleware] Authenticated access to ${req.nextUrl.pathname} for user: ${session.user.email}`)
    }
    
    // Return the response with any modified cookies 
    return res
  } catch (error) {
    console.error("[Middleware] Error:", error)
    // If there's an error, allow the request to continue
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}

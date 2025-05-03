import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from 'next/headers'

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

    // Skip auth checks for login, register, and auth routes
    if (
      req.nextUrl.pathname === "/" ||
      req.nextUrl.pathname.startsWith("/login") || 
      req.nextUrl.pathname.startsWith("/register") || 
      req.nextUrl.pathname.startsWith("/auth")
    ) {
      return res
    }

    // Protected routes that require authentication
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")
    
    if (isProtectedRoute) {
      console.log(`[Middleware] Checking auth for protected route: ${req.nextUrl.pathname}`)
      
      // IMPORTANT: For NextJS middleware, we need to use cookies() instead of the request's cookies
      // Using createRouteHandlerClient will require a workaround for middleware
      
      // TEMPORARY BYPASS - Uncomment this and comment out the authentication code below
      // to bypass authentication while debugging
      console.log(`[Middleware] Path: ${req.nextUrl.pathname}, Bypassing auth check temporarily`)
      return res
      
      /* 
      // Uncomment this block when ready to enforce authentication

      // Extract the session cookie directly
      const cookieStore = req.cookies
      const supabaseAuthCookie = cookieStore.get("sb-access-token") || 
                                 cookieStore.get("sb-refresh-token") || 
                                 cookieStore.get("supabase-auth-token")
      
      if (!supabaseAuthCookie) {
        console.log("[Middleware] No auth cookies found, redirecting to login")
        return NextResponse.redirect(new URL("/login", req.url))
      }
      
      console.log(`[Middleware] Found auth cookie, allowing access to ${req.nextUrl.pathname}`)
      */
    }
    
    // Return the response with any modified cookies 
    return res
  } catch (error) {
    console.error("[Middleware] Error:", error)
    // If there's an error, redirect to login for protected routes
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/login", req.url))
    }
    // Otherwise, allow the request to continue
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
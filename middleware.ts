import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(req: NextRequest) {
  try {
    console.log(`[Middleware] Processing request for: ${req.nextUrl.pathname}`)
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
      // TEMPORARY: Bypass auth checks while we fix authentication
      console.log(`[Middleware] Path: ${req.nextUrl.pathname}, Bypassing auth check temporarily`)
      return res
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
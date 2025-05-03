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

    // For now, just log the path and return response - skip auth checks until we fix authentication
    console.log(`[Middleware] Path: ${req.nextUrl.pathname}, Bypassing auth check temporarily`)
    
    // Protected routes that require authentication
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")
    
    // Temporary bypass for dashboard in development mode
    if (process.env.NODE_ENV === "development" && isProtectedRoute) {
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

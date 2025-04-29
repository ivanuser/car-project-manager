import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

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

    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Debug session information
    console.log(`[Middleware] Path: ${req.nextUrl.pathname}, Session: ${session ? "Yes" : "No"}`)

    // Public routes that don't require authentication
    const isPublicRoute =
      req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/login" || req.nextUrl.pathname.startsWith("/auth/")

    // Protected routes that require authentication
    const isProtectedRoute = req.nextUrl.pathname.startsWith("/dashboard")

    // If accessing a protected route without a session, redirect to login
    if (isProtectedRoute && !session) {
      console.log(`[Middleware] Redirecting to login from: ${req.nextUrl.pathname}`)
      const redirectUrl = new URL("/login", req.url)
      redirectUrl.searchParams.set("redirect", req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If accessing a public route with a session, redirect to dashboard
    if (isPublicRoute && session && req.nextUrl.pathname !== "/auth/callback") {
      console.log(`[Middleware] Redirecting to dashboard from: ${req.nextUrl.pathname}`)
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    // For all other routes, continue
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

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

    const supabase = createMiddlewareClient({ req, res })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Debug session information
    console.log("Middleware session check:", session ? "Session exists" : "No session")

    // If the user is not signed in and the current path is not / or /login or /auth/callback,
    // redirect the user to /login
    if (
      !session &&
      !req.nextUrl.pathname.startsWith("/login") &&
      !req.nextUrl.pathname.startsWith("/auth/callback") &&
      req.nextUrl.pathname !== "/"
    ) {
      console.log("Redirecting to login from:", req.nextUrl.pathname)
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // If the user is signed in and the current path is / or /login,
    // redirect the user to /dashboard
    if (session && (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/login")) {
      console.log("Redirecting to dashboard from:", req.nextUrl.pathname)
      return NextResponse.redirect(new URL("/dashboard", req.url))
    }

    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // If there's an error, allow the request to continue
    // This enables the pages to handle the error appropriately
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

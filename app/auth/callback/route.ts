import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const next = searchParams.get("next") || "/dashboard"

    console.log("[Auth Callback] Processing with code:", code ? "Present" : "Missing")

    if (code) {
      const supabase = createServerClient()
      const cookieStore = cookies()

      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("[Auth Callback] Error exchanging code for session:", error.message)
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url))
      }

      if (data.session) {
        console.log("[Auth Callback] Session created successfully")

        // Set the auth cookie
        cookieStore.set("supabase-auth-token", data.session.access_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })

        // Set a debug cookie
        cookieStore.set("auth-debug", new Date().toISOString(), {
          path: "/",
          maxAge: 300, // 5 minutes
        })

        // URL to redirect to after sign in process completes
        return NextResponse.redirect(new URL(next, request.url))
      } else {
        console.error("[Auth Callback] No session data returned")
        return NextResponse.redirect(new URL("/login?error=No+session+created", request.url))
      }
    } else {
      console.error("[Auth Callback] No code provided")
      return NextResponse.redirect(new URL("/login?error=No+authentication+code", request.url))
    }
  } catch (error) {
    console.error("[Auth Callback] Unexpected error:", error)
    return NextResponse.redirect(new URL("/login?error=Authentication+error", request.url))
  }
}

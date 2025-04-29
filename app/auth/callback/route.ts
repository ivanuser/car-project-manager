import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next") || "/dashboard"

  if (code) {
    const supabase = createServerClient()
    const cookieStore = cookies()

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    console.log("Auth callback:", error ? `Error: ${error.message}` : "Success")

    if (!error && data.session) {
      cookieStore.set("supabase-auth-token", data.session.access_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })

      // Add debug cookie to verify session was set
      cookieStore.set("auth-debug", "session-set", {
        path: "/",
        maxAge: 60, // 1 minute
      })
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(next, request.url))
}

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()
    const cookieStore = cookies()

    // Get all cookies for debugging
    const allCookies = cookieStore.getAll()
    const cookieNames = allCookies.map((cookie) => cookie.name)

    // Check for specific cookies
    const authCookie = cookieStore.get("supabase-auth-token")
    const debugCookie = cookieStore.get("auth-debug")

    // Get the session
    const { data, error } = await supabase.auth.getSession()

    // Try to get user
    const userResult = await supabase.auth.getUser()

    return NextResponse.json({
      session: data.session
        ? {
            exists: true,
            user: {
              id: data.session.user.id,
              email: data.session.user.email,
            },
            expires_at: data.session.expires_at,
          }
        : null,
      user: userResult.data.user
        ? {
            id: userResult.data.user.id,
            email: userResult.data.user.email,
          }
        : null,
      cookies: {
        all: cookieNames,
        authCookie: authCookie
          ? {
              name: authCookie.name,
              exists: true,
              // Don't expose the actual value for security reasons
              valuePreview: authCookie.value ? `${authCookie.value.substring(0, 10)}...` : null,
            }
          : null,
        debugCookie: debugCookie
          ? {
              name: debugCookie.name,
              value: debugCookie.value,
            }
          : null,
      },
      error: error ? error.message : null,
    })
  } catch (error) {
    console.error("Session debug error:", error)
    return NextResponse.json(
      {
        error: "Failed to debug session",
        errorDetails: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

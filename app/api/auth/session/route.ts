import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()
    const cookieStore = cookies()

    // Check for auth debug cookie
    const debugCookie = cookieStore.get("auth-debug")

    // Get the session
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      return NextResponse.json(
        {
          error: error.message,
          debugCookie: debugCookie?.value,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      session: data.session
        ? {
            user: {
              id: data.session.user.id,
              email: data.session.user.email,
            },
            expires_at: data.session.expires_at,
          }
        : null,
      debugCookie: debugCookie?.value,
    })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json(
      {
        error: "Failed to check session",
        errorDetails: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

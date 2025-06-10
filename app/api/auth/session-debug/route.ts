// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth/current-user"

export async function GET() {
  try {
    const cookieStore = cookies()

    // Get all cookies for debugging
    const allCookies = cookieStore.getAll()
    const cookieNames = allCookies.map((cookie) => cookie.name)

    // Check for specific cookies
    const authCookie = cookieStore.get("auth-token") || cookieStore.get("cajpro_auth_token")
    const debugCookie = cookieStore.get("auth-debug")

    // Get the current user using our PostgreSQL auth system
    const currentUser = await getCurrentUser()

    return NextResponse.json({
      session: currentUser
        ? {
            exists: true,
            user: {
              id: currentUser.userId,
              email: currentUser.email,
            },
          }
        : null,
      user: currentUser
        ? {
            id: currentUser.userId,
            email: currentUser.email,
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
      authSystem: "PostgreSQL",
      error: null,
    })
  } catch (error) {
    console.error("Session debug error:", error)
    return NextResponse.json(
      {
        error: "Failed to debug session",
        errorDetails: error instanceof Error ? error.message : String(error),
        authSystem: "PostgreSQL",
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import db from "@/lib/db"
import { cookies } from "next/headers"
import jwtUtils from "@/lib/auth/jwt"

export async function GET() {
  try {
    // Test database connection
    const dbResult = await db.query("SELECT COUNT(*) FROM profiles LIMIT 1")

    if (!dbResult) {
      return NextResponse.json(
        {
          connected: false,
          error: "Database query failed",
          details: "Could not retrieve profile count",
        },
        { status: 500 },
      )
    }

    // Test auth connection by verifying any existing auth token
    const cookieStore = cookies()
    const authToken = cookieStore.get('cajpro_auth_token')?.value
    
    let authStatus = "no token"
    let userId = null
    
    if (authToken) {
      try {
        const payload = jwtUtils.verifyToken(authToken)
        if (payload && !jwtUtils.isTokenExpired(authToken)) {
          userId = payload.sub
          authStatus = "valid token"
        } else {
          authStatus = "expired or invalid token"
        }
      } catch (error) {
        authStatus = "token verification error"
      }
    }
    
    // If we have a user ID, check if the user exists
    let userExists = false
    if (userId) {
      const userResult = await db.query(
        "SELECT COUNT(*) FROM auth.users WHERE id = $1",
        [userId]
      )
      userExists = userResult.rows[0].count > 0
    }

    return NextResponse.json({
      connected: true,
      dbTest: "passed",
      authTest: authStatus,
      userId: userId ? "present" : "none",
      userExists,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
        isDevelopment: process.env.NODE_ENV === "development",
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Exception thrown during connection test",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Test database connection
    const { data, error } = await supabase.from("profiles").select("count").limit(1)

    if (error) {
      return NextResponse.json(
        {
          connected: false,
          error: error.message,
          details: "Database query failed",
        },
        { status: 500 },
      )
    }

    // Test auth connection
    const { data: authData, error: authError } = await supabase.auth.getSession()

    if (authError) {
      return NextResponse.json(
        {
          connected: false,
          error: authError.message,
          details: "Auth service connection failed",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      connected: true,
      dbTest: "passed",
      authTest: "passed",
      env: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasSiteUrl: !!process.env.NEXT_PUBLIC_SITE_URL,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        details: "Exception thrown during connection test",
      },
      { status: 500 },
    )
  }
}

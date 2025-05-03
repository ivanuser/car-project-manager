import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Get all cookies for debugging
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    const cookieNames = allCookies.map(cookie => cookie.name)
    
    // Check if auth cookie exists
    const authCookie = cookieStore.get("supabase-auth-token")
    
    // Initialize Supabase client
    const supabase = createServerClient()
    
    // Get session information
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    // Get user information
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    // Return all the debug information
    return NextResponse.json({
      time: new Date().toISOString(),
      cookies: {
        count: allCookies.length,
        names: cookieNames,
        authCookieExists: !!authCookie
      },
      session: {
        exists: !!sessionData?.session,
        error: sessionError ? sessionError.message : null,
      },
      user: {
        exists: !!userData?.user,
        email: userData?.user?.email || null,
        error: userError ? userError.message : null,
      }
    })
  } catch (error) {
    console.error("Error in auth debug route:", error)
    return NextResponse.json({
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

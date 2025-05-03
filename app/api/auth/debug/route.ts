import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Get all cookies for debugging
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    const cookieDetails = allCookies.map(cookie => ({
      name: cookie.name,
      value: cookie.name.includes('token') ? '[REDACTED]' : cookie.value.substring(0, 30) + (cookie.value.length > 30 ? '...' : ''),
      path: cookie.path,
      expires: cookie.expires
    }))
    
    // Check if Supabase auth cookie exists
    const supabaseAuthCookie = cookieStore.get("sb-access-token") || 
                              cookieStore.get("sb-refresh-token") || 
                              cookieStore.get("supabase-auth-token")
    
    // Check if NextAuth cookies exist
    const nextAuthCookies = allCookies.filter(c => c.name.startsWith('next-auth'))
    
    // Initialize Supabase client
    const supabase = createServerClient()
    
    // Get session information
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    // Get user information
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    // Return all the debug information
    return NextResponse.json({
      time: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not set'
      },
      cookies: {
        count: allCookies.length,
        details: cookieDetails,
        supabaseAuthExists: !!supabaseAuthCookie,
        nextAuthExists: nextAuthCookies.length > 0
      },
      session: {
        exists: !!sessionData?.session,
        sessionId: sessionData?.session?.id ? sessionData.session.id.substring(0, 8) + '...' : null,
        expiresAt: sessionData?.session?.expires_at ? new Date(sessionData.session.expires_at * 1000).toISOString() : null,
        error: sessionError ? sessionError.message : null
      },
      user: {
        exists: !!userData?.user,
        email: userData?.user?.email || null,
        id: userData?.user?.id ? userData.user.id.substring(0, 8) + '...' : null,
        error: userError ? userError.message : null
      }
    })
  } catch (error) {
    console.error("Error in auth debug route:", error)
    return NextResponse.json({
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}

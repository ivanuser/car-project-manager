import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Get all cookies
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    // Delete all auth-related cookies
    for (const cookie of allCookies) {
      if (
        cookie.name.startsWith('next-auth') || 
        cookie.name.startsWith('sb-') || 
        cookie.name.includes('supabase') ||
        cookie.name.includes('auth')
      ) {
        cookieStore.delete(cookie.name)
      }
    }
    
    // Try to sign out from Supabase
    const supabase = createServerClient()
    await supabase.auth.signOut()
    
    return NextResponse.json({
      success: true,
      message: "All authentication state has been reset",
      deletedCookies: allCookies
        .filter(c => 
          c.name.startsWith('next-auth') || 
          c.name.startsWith('sb-') || 
          c.name.includes('supabase') ||
          c.name.includes('auth')
        )
        .map(c => c.name)
    })
  } catch (error) {
    console.error("Error in auth reset route:", error)
    return NextResponse.json({
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

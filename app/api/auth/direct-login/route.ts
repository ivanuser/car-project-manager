import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function POST(request: Request) {
  try {
    // Parse request body
    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }
    
    console.log(`Attempting direct login for: ${email}`)
    
    // Create server client with cookies
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      console.error("Direct login error:", error.message)
      return NextResponse.json({ error: error.message }, { status: 401 })
    }
    
    if (!data.session) {
      return NextResponse.json({ error: "No session created" }, { status: 500 })
    }
    
    console.log(`Direct login successful for: ${email}`)
    console.log(`Session expires at: ${new Date(data.session.expires_at * 1000).toISOString()}`)
    
    // The session cookies are automatically handled by the createRouteHandlerClient
    
    // Create user profile if it doesn't exist (bypass RLS)
    try {
      const adminClient = createServerClient()
      
      const { data: profile } = await adminClient
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()
        
      if (!profile) {
        const { error: profileError } = await adminClient
          .from('profiles')
          .insert({
            id: data.user.id,
            full_name: email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          
        if (profileError) {
          console.error("Error creating profile:", profileError)
        } else {
          console.log("Created profile for user")
        }
      }
    } catch (profileError) {
      console.error("Error checking/creating profile:", profileError)
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email
      },
      sessionExpires: new Date(data.session.expires_at * 1000).toISOString()
    })
  } catch (error) {
    console.error("Unexpected error during direct login:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}

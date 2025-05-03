"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import { createAdminClient } from "@/lib/admin-client"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("name") as string

  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    console.error("Sign up error:", error.message)
    return { error: error.message }
  }

  // Create a profile record
  if (data.user) {
    // Use admin client to bypass RLS
    const adminClient = createAdminClient()
    const { error: profileError } = await adminClient.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
    })

    if (profileError) {
      console.error("Profile creation error:", profileError.message)
      return { error: profileError.message }
    }
  }

  return { success: true, message: "Check your email to confirm your account" }
}

export async function signIn(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    console.log("Sign in attempt for:", email)

    const supabase = createServerClient()

    // Attempt to sign in with credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Sign in error:", error.message)
      return { error: error.message }
    }

    console.log("Sign in successful for:", email)
    console.log("Session data:", data.session ? "Session exists" : "No session")

    // Ensure a user profile exists
    if (data.user) {
      try {
        // Use admin client to bypass RLS
        const adminClient = createAdminClient()
        
        // Check if profile exists
        const { data: profile, error: profileError } = await adminClient
          .from('profiles')
          .select()
          .eq('id', data.user.id)
          .single()
          
        if (profileError || !profile) {
          // Create profile if it doesn't exist
          const { error: insertError } = await adminClient.from('profiles').insert({
            id: data.user.id,
            full_name: email.split('@')[0], // Use email username as fallback
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          
          if (insertError) {
            console.error("Error creating profile:", insertError)
          } else {
            console.log("Created new profile for user")
          }
        } else {
          console.log("Existing profile found for user")
        }
      } catch (profileError) {
        console.error("Error managing user profile:", profileError)
      }
    }

    // Note: Supabase handles its own cookies - we don't need to manually set them

    // Set a debug cookie just for logging
    const cookieStore = cookies()
    cookieStore.set("auth-debug-time", new Date().toISOString(), {
      path: "/",
      maxAge: 300, // 5 minutes
    })

    // Redirect after successful login
    return {
      success: true,
      redirectUrl: "/dashboard",
      user: {
        id: data.user.id,
        email: data.user.email,
      },
    }
  } catch (error) {
    console.error("Unexpected error during sign in:", error)
    return { error: "An unexpected error occurred during sign in" }
  }
}

export async function signOut() {
  try {
    const supabase = createServerClient()
    await supabase.auth.signOut()

    // Clear cookies
    const cookieStore = cookies()
    
    // Try to clear common auth cookies
    const cookiesToClear = [
      "supabase-auth-token",
      "sb-access-token",
      "sb-refresh-token",
      "next-auth.session-token",
      "next-auth.csrf-token",
      "next-auth.callback-url",
      "__supabase_auth_token",
      "auth-debug",
      "auth-debug-time"
    ]
    
    for (const cookieName of cookiesToClear) {
      try {
        cookieStore.delete(cookieName)
      } catch (e) {
        // Ignore errors when clearing cookies
      }
    }

    redirect("/login")
  } catch (error) {
    console.error("Error during sign out:", error)
    redirect("/login")
  }
}

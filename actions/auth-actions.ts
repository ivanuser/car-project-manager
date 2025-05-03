"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"
import { createAdminClient } from "@/lib/admin-client"
import { ensureUserProfile } from "@/lib/auth-helpers"

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

    // Attempt to sign in directly - no need to check if user exists first
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
      const profileResult = await ensureUserProfile(data.user.id, email)
      if (!profileResult.success) {
        console.error("Warning: Failed to ensure user profile exists:", profileResult.error)
      }
    }

    // Set cookies for client-side auth
    const cookieStore = cookies()

    if (data.session) {
      // Set the auth cookie
      cookieStore.set("supabase-auth-token", data.session.access_token, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })

      // Set a debug cookie to verify cookie setting works
      cookieStore.set("auth-debug", new Date().toISOString(), {
        path: "/",
        maxAge: 300, // 5 minutes
      })

      console.log("Auth cookies set successfully")
    } else {
      console.error("No session data available after successful login")
      return { error: "Authentication succeeded but no session was created" }
    }

    return {
      success: true,
      shouldRedirect: true,
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
  const supabase = createServerClient()
  await supabase.auth.signOut()

  // Clear cookies
  const cookieStore = cookies()
  cookieStore.delete("supabase-auth-token")
  cookieStore.delete("auth-debug")

  redirect("/login")
}

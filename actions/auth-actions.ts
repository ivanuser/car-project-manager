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

    // Do not manually set cookies here - let Supabase handle its own cookies
    console.log("Using supabase session management - not setting manual cookies")

    // Set a debug cookie just for logging/debugging
    const cookieStore = cookies()
    cookieStore.set("auth-debug", new Date().toISOString(), {
      path: "/",
      maxAge: 300, // 5 minutes
    })

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

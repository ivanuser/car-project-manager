"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"

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
    return { error: error.message }
  }

  // Create a profile record
  if (data.user) {
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name: fullName,
    })

    if (profileError) {
      return { error: profileError.message }
    }
  }

  return { success: true, message: "Check your email to confirm your account" }
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = createServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Set cookies for client-side auth
  const cookieStore = cookies()
  const { data: sessionData } = await supabase.auth.getSession()

  if (sessionData?.session) {
    cookieStore.set("supabase-auth-token", sessionData.session.access_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    })
  }

  // Return success with redirect flag
  return { success: true, shouldRedirect: true }
}

export async function signOut() {
  const supabase = createServerClient()
  await supabase.auth.signOut()

  // Clear cookies
  const cookieStore = cookies()
  cookieStore.delete("supabase-auth-token")

  redirect("/login")
}

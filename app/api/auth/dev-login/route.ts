import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

// This route should only be accessible in development
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "This route is only available in development mode" }, { status: 403 })
  }

  try {
    const supabase = createServerClient()

    // Create a development user if it doesn't exist
    const devEmail = "dev@cajpro.local"
    const devPassword = "devpassword123"

    // Check if user exists
    const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", devEmail).single()

    if (!existingUser) {
      // Create the user
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: devEmail,
        password: devPassword,
        options: {
          data: {
            full_name: "Development User",
            role: "admin", // Give admin role for testing
          },
        },
      })

      if (signUpError) {
        return NextResponse.json({ error: "Failed to create development user", details: signUpError }, { status: 500 })
      }

      // Create profile record
      if (newUser?.user) {
        await supabase.from("profiles").insert({
          id: newUser.user.id,
          full_name: "Development User",
          email: devEmail,
          role: "admin",
        })
      }
    }

    // Sign in the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword,
    })

    if (error) {
      return NextResponse.json({ error: "Failed to sign in development user", details: error }, { status: 500 })
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

      // Set a debug cookie
      cookieStore.set("auth-debug", new Date().toISOString(), {
        path: "/",
        maxAge: 300, // 5 minutes
      })
    }

    return NextResponse.json({
      success: true,
      message: "Development user signed in successfully",
      user: {
        id: data.user?.id,
        email: data.user?.email,
        role: "admin",
      },
    })
  } catch (error) {
    console.error("Dev login error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

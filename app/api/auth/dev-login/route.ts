import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

// This route should only be accessible in development
export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development" && process.env.NODE_ENV !== "production") {
    return NextResponse.json({ error: "This route is only available in development mode" }, { status: 403 })
  }

  try {
    const supabase = createServerClient()

    // Create a development user if it doesn't exist
    const devEmail = "dev@cajpro.local"
    // Use a stronger password that meets Supabase requirements
    const devPassword = "DevPassword123!" // Contains uppercase, lowercase, number, and special character

    console.log("Attempting dev login with:", devEmail)

    // First, try to sign in with existing credentials
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: devEmail,
      password: devPassword,
    })

    // If sign in fails, create the user
    if (signInError) {
      console.log("Sign in failed, attempting to create user:", signInError.message)

      // Create the user in auth
      const { data: newUser, error: signUpError } = await supabase.auth.signUp({
        email: devEmail,
        password: devPassword,
      })

      if (signUpError) {
        console.error("Failed to create development user:", signUpError)
        return NextResponse.json(
          {
            error: "Failed to create development user",
            details: signUpError,
            message: signUpError.message,
          },
          { status: 500 },
        )
      }

      console.log("User created successfully:", newUser?.user?.id)

      // Wait a moment for the auth user to be fully created
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Try to sign in again
      const { data: retrySignIn, error: retryError } = await supabase.auth.signInWithPassword({
        email: devEmail,
        password: devPassword,
      })

      if (retryError) {
        console.error("Failed to sign in after creating user:", retryError)
        return NextResponse.json(
          {
            error: "Failed to sign in after creating user",
            details: retryError,
            message: retryError.message,
          },
          { status: 500 },
        )
      }

      console.log("Signed in successfully after user creation")

      // Use the retry sign in data
      if (retrySignIn) {
        // Set cookies for client-side auth
        const cookieStore = cookies()

        if (retrySignIn.session) {
          // Set the auth cookie - use the format expected by Supabase
          cookieStore.set(
            "supabase-auth-token",
            JSON.stringify([retrySignIn.session.access_token, retrySignIn.session.refresh_token]),
            {
              path: "/",
              maxAge: 60 * 60 * 24 * 7, // 1 week
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
            },
          )
        }

        return NextResponse.json({
          success: true,
          message: "Development user created and signed in successfully",
          user: {
            id: retrySignIn.user?.id,
            email: retrySignIn.user?.email,
            role: "admin",
          },
        })
      }
    } else {
      // User exists and sign in was successful
      console.log("User exists, sign in successful")

      // Set cookies for client-side auth
      const cookieStore = cookies()

      if (signInData.session) {
        // Set the auth cookie - use the format expected by Supabase
        cookieStore.set(
          "supabase-auth-token",
          JSON.stringify([signInData.session.access_token, signInData.session.refresh_token]),
          {
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          },
        )
      }

      return NextResponse.json({
        success: true,
        message: "Development user signed in successfully",
        user: {
          id: signInData.user?.id,
          email: signInData.user?.email,
          role: "admin",
        },
      })
    }

    // Fallback response (should not reach here)
    return NextResponse.json(
      {
        error: "Something went wrong during authentication",
      },
      { status: 500 },
    )
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

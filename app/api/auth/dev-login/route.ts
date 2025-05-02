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
    const devPassword = "devpassword123"

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
        return NextResponse.json({ error: "Failed to create development user", details: signUpError }, { status: 500 })
      }

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
          { error: "Failed to sign in after creating user", details: retryError },
          { status: 500 },
        )
      }

      // Check if profiles table exists, if not, create it
      const { error: tableCheckError } = await supabase.from("profiles").select("count").limit(1)

      if (
        tableCheckError &&
        tableCheckError.message.includes("relation") &&
        tableCheckError.message.includes("does not exist")
      ) {
        console.log("Profiles table doesn't exist, creating it...")

        // Create profiles table
        const { error: createTableError } = await supabase.rpc("exec_sql", {
          sql: `
            CREATE TABLE IF NOT EXISTS profiles (
              id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              full_name TEXT,
              email TEXT,
              avatar_url TEXT,
              role TEXT DEFAULT 'user'
            );
          `,
        })

        if (createTableError) {
          console.error("Failed to create profiles table:", createTableError)
          // Continue anyway, the table might exist but with different permissions
        }
      }

      // Create profile record if user was created
      if (newUser?.user) {
        const { error: profileError } = await supabase.from("profiles").insert({
          id: newUser.user.id,
          full_name: "Development User",
          email: devEmail,
          role: "admin",
        })

        if (profileError) {
          console.error("Failed to create profile record:", profileError)
          // Continue anyway, the profile might already exist
        }
      }

      // Use the retry sign in data
      if (retrySignIn) {
        // Set cookies for client-side auth
        const cookieStore = cookies()

        if (retrySignIn.session) {
          cookieStore.set("sb-access-token", retrySignIn.session.access_token, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          })

          cookieStore.set("sb-refresh-token", retrySignIn.session.refresh_token, {
            path: "/",
            maxAge: 60 * 60 * 24 * 7, // 1 week
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
          })
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
      // Set cookies for client-side auth
      const cookieStore = cookies()

      if (signInData.session) {
        cookieStore.set("sb-access-token", signInData.session.access_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })

        cookieStore.set("sb-refresh-token", signInData.session.refresh_token, {
          path: "/",
          maxAge: 60 * 60 * 24 * 7, // 1 week
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
        })
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

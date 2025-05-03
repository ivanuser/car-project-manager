import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { ensureUserProfile } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    // Parse request body
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    console.log(`Attempting direct login for: ${email}`);

    // Create server client with cookies using the correct helper for Route Handlers
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Add a debug log to verify Supabase client creation
    console.log("Supabase client created successfully");

    // Sign in with detailed error logging
    console.log("Attempting signInWithPassword...");
    const signInResult = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    console.log("Sign in result received:", 
      signInResult.error ? 
        `Error: ${signInResult.error.message}` : 
        "Success"
    );

    const { data, error } = signInResult;

    if (error) {
      console.error("Direct login error:", error.message, error);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.session) {
      console.error("Direct login succeeded but no session data received.");
      return NextResponse.json({ error: "Login successful but failed to establish session" }, { status: 500 });
    }

    console.log(`Direct login successful for: ${email}`);
    console.log(`Session expires at: ${new Date(data.session.expires_at * 1000).toISOString()}`);
    console.log("Session ID:", data.session.id);

    // Set a debug cookie to verify cookie setting is working
    cookieStore.set("auth-debug-direct", new Date().toISOString(), {
      path: "/",
      maxAge: 300, // 5 minutes
      httpOnly: false,
    });

    try {
      // Ensure user profile exists
      const profileResult = await ensureUserProfile(data.user.id, email);
      console.log("Profile result:", profileResult.success ? "Success" : "Failed");
    } catch (profileError) {
      console.error("Error in profile creation (non-blocking):", profileError);
    }

    // Return success response
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      sessionExpires: new Date(data.session.expires_at * 1000).toISOString(),
    });
  } catch (error) {
    console.error("Unexpected error during direct login:", error);
    return NextResponse.json(
      { 
        error: "An internal server error occurred during login.",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

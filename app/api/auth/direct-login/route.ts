import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// Removed: import { createServerClient } from "@/lib/supabase" // No longer needed here
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { ensureUserProfile } from "@/lib/auth-helpers"; // <-- Import the helper

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

    // Sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Direct login error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 401 });
    }

    if (!data.session) {
      // This case should ideally not happen if signInWithPassword doesn't error, but good to check
      console.error("Direct login succeeded but no session data received.");
      return NextResponse.json({ error: "Login successful but failed to establish session" }, { status: 500 });
    }

    console.log(`Direct login successful for: ${email}`);
    console.log(`Session expires at: ${new Date(data.session.expires_at * 1000).toISOString()}`);

    // The session cookies are automatically handled by the createRouteHandlerClient

    // Ensure user profile exists using the helper function
    // This handles the logic including potential profile creation safely
    const profileResult = await ensureUserProfile(data.user.id, email);
    if (!profileResult.success) {
      // Log the error but don't necessarily block the login process
      console.error("Error ensuring user profile exists:", profileResult.error);
      // You might decide to return an error here if a profile is absolutely required immediately
      // return NextResponse.json({ error: "Failed to setup user profile." }, { status: 500 });
    } else {
        console.log("User profile ensured for:", email);
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
    // Generic error for security
    return NextResponse.json(
      { error: "An internal server error occurred during login." },
      { status: 500 }
    );
  }
}

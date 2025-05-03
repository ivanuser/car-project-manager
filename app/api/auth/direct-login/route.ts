import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { ensureUserProfile } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    // Parse request body
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    console.log(`Attempting direct login for: ${email}`);

    // Create a standard Supabase client without automatic cookie handling
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: "Supabase configuration is missing" }, { status: 500 });
    }
    
    // Use the direct client without cookie handling to avoid middleware loops
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log("Supabase client created without cookie handling");

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
    console.log("Session token:", data.session.access_token ? "Present (length: " + data.session.access_token.length + ")" : "Missing");
    console.log("Refresh token:", data.session.refresh_token ? "Present" : "Missing");

    // Manually set the auth cookies
    const cookieStore = cookies();
    
    // Extract the project reference from the URL
    const projectRef = supabaseUrl.split('//')[1].split('.')[0];
    console.log("Project reference:", projectRef);
    
    // Store full session data as JSON
    const sessionData = JSON.stringify({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      user: {
        id: data.user.id,
        email: data.user.email
      }
    });
    
    // Set the full session cookie
    cookieStore.set(`sb-${projectRef}-auth-token`, sessionData, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax"
    });
    
    // Set individual token cookies as fallback
    cookieStore.set(`sb-access-token`, data.session.access_token, {
      path: "/",
      maxAge: 60 * 60, // 1 hour
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax"
    });
    
    cookieStore.set(`sb-refresh-token`, data.session.refresh_token, {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax"
    });
    
    // Set a debug cookie that is visible to JavaScript
    cookieStore.set("auth-debug-direct", `Login successful at ${new Date().toISOString()}`, {
      path: "/",
      maxAge: 300, // 5 minutes
      secure: false,
      httpOnly: false,
    });

    console.log("Auth cookies set:", 
      cookieStore.getAll().map(c => c.name).join(", ")
    );

    try {
      // Ensure user profile exists
      const profileResult = await ensureUserProfile(data.user.id, email);
      console.log("Profile result:", profileResult.success ? "Success" : "Failed");
    } catch (profileError) {
      console.error("Error in profile creation (non-blocking):", profileError);
    }

    // Return success response with session details
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      sessionExpires: new Date(data.session.expires_at * 1000).toISOString(),
      // Include only a token indicator, not the actual tokens
      tokenInfo: {
        accessTokenPresent: !!data.session.access_token,
        refreshTokenPresent: !!data.session.refresh_token,
        cookiesSet: cookieStore.getAll().map(c => c.name)
      }
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

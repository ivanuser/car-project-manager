import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Get Supabase config
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    
    // Check for Supabase auth cookies manually
    let authCookie = null;
    const projectRef = supabaseUrl.split('//')[1]?.split('.')[0];
    if (projectRef) {
      authCookie = cookieStore.get(`sb-${projectRef}-auth-token`);
    }
    
    // Create a simple Supabase client without cookie handling
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Check session using the API, don't rely on cookie handling
    const sessionData = authCookie ? 
      // If we have an auth cookie, try to get the session
      await supabase.auth.getUser(authCookie.value) : 
      { data: { user: null }, error: null };
    
    return NextResponse.json({
      cookieCheck: {
        cookieCount: allCookies.length,
        cookieNames: allCookies.map(c => c.name),
        authCookieExists: !!authCookie,
        authCookieValue: authCookie ? "[REDACTED FOR SECURITY]" : null
      },
      authenticated: !!sessionData.data.user,
      user: sessionData.data.user ? {
        id: sessionData.data.user.id,
        email: sessionData.data.user.email,
      } : null,
      error: sessionData.error?.message
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    // Create Supabase client
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Get session and user info
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    return NextResponse.json({
      authenticated: !!sessionData?.session,
      cookieCount: allCookies.length,
      cookieNames: allCookies.map(c => c.name),
      sessionError: sessionError?.message,
      user: sessionData?.session?.user ? {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email,
      } : null,
      sessionExpires: sessionData?.session?.expires_at ? 
        new Date(sessionData.session.expires_at * 1000).toISOString() : null,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({
      authenticated: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

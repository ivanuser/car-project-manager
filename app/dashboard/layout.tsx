import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@supabase/supabase-js"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { GradientBackground } from "@/components/gradient-background"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if we're in preview mode without Supabase config
  const isMissingConfig = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const isDevelopment = process.env.NODE_ENV === "development"

  // Initialize user data as null - no default/mock user
  let userProfile = null

  // Try to get real user data if we have Supabase configured
  if (!isMissingConfig) {
    try {
      // Get Supabase config
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      
      // Get cookies manually
      const cookieStore = cookies();
      const allCookies = cookieStore.getAll();
      
      console.log("Dashboard: Available cookies:", allCookies.map(c => c.name).join(', '));
      
      // Check for auth token directly
      const projectRef = supabaseUrl.split('//')[1].split('.')[0];
      const authCookie = cookieStore.get(`sb-${projectRef}-auth-token`);
      
      let accessToken = "";
      let user = null;
      
      if (authCookie) {
        try {
          // Try to parse the session cookie
          const sessionData = JSON.parse(authCookie.value);
          console.log("Dashboard: Found session cookie with data");
          
          if (sessionData.access_token) {
            accessToken = sessionData.access_token;
            user = sessionData.user;
            console.log("Dashboard: Using token from session cookie");
          }
        } catch (parseError) {
          // If parsing fails, the cookie might be the token itself
          console.log("Dashboard: Session cookie parse error:", 
            parseError instanceof Error ? parseError.message : String(parseError));
          accessToken = authCookie.value;
          console.log("Dashboard: Using cookie value as token");
        }
      } else {
        // Try fallback cookies
        const accessTokenCookie = cookieStore.get('sb-access-token');
        if (accessTokenCookie) {
          accessToken = accessTokenCookie.value;
          console.log("Dashboard: Using fallback access token cookie");
        }
      }
      
      // Create Supabase client with the token if we have one
      if (accessToken) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
        
        // Use the token to get user info
        const { data: userResponse, error: userError } = await supabase.auth.getUser(accessToken);
        
        if (userError) {
          console.error("Dashboard: Error getting user data:", userError.message);
        } else if (userResponse.user) {
          user = userResponse.user;
          console.log("Dashboard: Found user via token:", user.email);
          
          // Get the user's profile
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name, avatar_url")
            .eq("id", user.id)
            .single();
          
          userProfile = {
            id: user.id,
            email: user.email,
            fullName: profile?.full_name || undefined,
            avatarUrl: profile?.avatar_url || undefined,
          };
          
          console.log("Dashboard: Using authenticated user:", userProfile.email);
        }
      }
      
      if (!user) {
        console.log("Dashboard: No authenticated user found - will redirect");
        
        // Return content that will redirect client-side
        // This is more reliable than server-side redirect in this case
        return (
          <html lang="en">
            <body>
              <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                  <h1 className="text-2xl font-bold">Authentication Required</h1>
                  <p className="mt-2">Redirecting to login page...</p>
                  <script dangerouslySetInnerHTML={{ __html: `
                    console.log("Redirecting to login due to missing authentication");
                    window.location.href = '/login';
                  `}} />
                </div>
              </div>
            </body>
          </html>
        );
      }
    } catch (error) {
      console.error("Error in dashboard auth check:", error);
      // Continue with preview user data
    }
  }

  // Database initialization check
  if (isDevelopment) {
    const initializeDb = process.env.INITIALIZE_DB === 'true';
    if (initializeDb) {
      console.log("Database initialization enabled - will initialize database");
      // Here you would add logic to initialize the database
      // For now we're just logging that it's enabled
    } else {
      console.log("Database initialization skipped - set INITIALIZE_DB=true to enable");
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Gradient background with increased intensity */}
      <GradientBackground intensity="strong" />

      <div className="flex min-h-screen bg-background/80 backdrop-blur-[2px] relative">
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        <div className="flex w-full flex-col">
          <Header user={userProfile} />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}

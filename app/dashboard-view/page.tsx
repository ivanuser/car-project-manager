import BasicDashboard from '../dashboard/basic-page';
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { GradientBackground } from "@/components/gradient-background";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

// This is a clone of the dashboard layout that works around the route.ts conflict
export default async function DashboardViewPage() {
  // Check if we're in preview mode without Supabase config
  const isMissingConfig = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isDevelopment = process.env.NODE_ENV === "development";

  // Initialize user data as null
  let userProfile = null;

  // Try to get real user data if we have Supabase configured
  if (!isMissingConfig) {
    try {
      // Get Supabase config
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      
      // Get cookies manually
      const cookieStore = cookies();
      const allCookies = cookieStore.getAll();
      
      console.log("Dashboard-View: Available cookies:", allCookies.map(c => c.name).join(', '));
      
      // Check for auth token directly
      const projectRef = supabaseUrl.split('//')[1].split('.')[0];
      const authCookie = cookieStore.get(`sb-${projectRef}-auth-token`);
      
      let accessToken = "";
      let user = null;
      
      if (authCookie) {
        try {
          // Try to parse the session cookie
          const sessionData = JSON.parse(authCookie.value);
          console.log("Dashboard-View: Found session cookie with data");
          
          if (sessionData.access_token) {
            accessToken = sessionData.access_token;
            user = sessionData.user;
            console.log("Dashboard-View: Using token from session cookie");
          }
        } catch (parseError) {
          // If parsing fails, the cookie might be the token itself
          console.log("Dashboard-View: Session cookie parse error:", 
            parseError instanceof Error ? parseError.message : String(parseError));
          accessToken = authCookie.value;
          console.log("Dashboard-View: Using cookie value as token");
        }
      } else {
        // Try fallback cookies
        const accessTokenCookie = cookieStore.get('sb-access-token');
        if (accessTokenCookie) {
          accessToken = accessTokenCookie.value;
          console.log("Dashboard-View: Using fallback access token cookie");
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
          console.error("Dashboard-View: Error getting user data:", userError.message);
        } else if (userResponse.user) {
          user = userResponse.user;
          console.log("Dashboard-View: Found user via token:", user.email);
          
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
          
          console.log("Dashboard-View: Using authenticated user:", userProfile.email);
        }
      }
    } catch (error) {
      console.error("Error in dashboard-view auth check:", error);
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
            <BasicDashboard />
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}

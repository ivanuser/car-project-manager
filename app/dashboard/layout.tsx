import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { GradientBackground } from "@/components/gradient-background"
import jwtUtils from "@/lib/auth/jwt"
import db from "@/lib/db"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDevelopment = process.env.NODE_ENV === "development";
  
  // Initialize user data as null
  let userProfile = null;

  try {
    // Get auth token from cookies
    const cookieStore = cookies();
    const authToken = cookieStore.get('cajpro_auth_token')?.value;
    
    console.log("Dashboard: Checking authentication");
    
    let userId = null;
    
    // Verify token if it exists
    if (authToken) {
      try {
        const payload = jwtUtils.verifyToken(authToken);
        if (payload && !jwtUtils.isTokenExpired(authToken)) {
          userId = payload.sub;
          console.log("Dashboard: Found valid authentication token for user:", userId);
        }
      } catch (tokenError) {
        console.error("Dashboard: Token validation error:", 
          tokenError instanceof Error ? tokenError.message : String(tokenError));
      }
    }
    
    // Special case for development mode
    if (!userId && isDevelopment) {
      console.log("Dashboard: Development mode detected, checking for admin user");
      
      // In development, try to find admin user
      const adminResult = await db.query(
        `SELECT id FROM auth.users WHERE email = 'admin@cajpro.local' LIMIT 1`
      );
      
      if (adminResult.rows.length > 0) {
        userId = adminResult.rows[0].id;
        console.log("Dashboard: Using admin user for development:", userId);
      }
    }
    
    if (userId) {
      // Get user data
      const userResult = await db.query(
        `SELECT email FROM auth.users WHERE id = $1`,
        [userId]
      );
      
      if (userResult.rows.length > 0) {
        const email = userResult.rows[0].email;
        
        // Get profile data
        const profileResult = await db.query(
          `SELECT full_name, avatar_url FROM profiles WHERE id = $1`,
          [userId]
        );
        
        userProfile = {
          id: userId,
          email: email,
          fullName: profileResult.rows[0]?.full_name || undefined,
          avatarUrl: profileResult.rows[0]?.avatar_url || undefined,
        };
        
        console.log("Dashboard: Using authenticated user:", userProfile.email);
      }
    }
    
    if (!userProfile && !isDevelopment) {
      console.log("Dashboard: No authenticated user found - will redirect");
      
      // Return content that will redirect client-side
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
    
    // For development, use a default user if none found
    if (!userProfile && isDevelopment) {
      console.log("Dashboard: Creating default user profile for development");
      userProfile = {
        id: "admin-dev-mode",
        email: "admin@cajpro.local",
        fullName: "Admin User",
        avatarUrl: undefined,
      };
    }
  } catch (error) {
    console.error("Error in dashboard auth check:", error);
    // Continue with development mode if available
    if (isDevelopment) {
      userProfile = {
        id: "admin-dev-mode",
        email: "admin@cajpro.local",
        fullName: "Admin User",
        avatarUrl: undefined,
      };
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

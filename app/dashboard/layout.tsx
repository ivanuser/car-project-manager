import type React from "react"
import { cookies } from "next/headers"

import { createServerClient } from "@/lib/supabase"
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
  let userData = null

  // Try to get real user data if we have Supabase configured
  if (!isMissingConfig) {
    try {
      const cookieStore = cookies()
      const supabase = createServerClient()

      // Get the current session first
      const { data: sessionData } = await supabase.auth.getSession()
      console.log("Dashboard layout: Session check:", sessionData.session ? "Session exists" : "No session")
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log("Dashboard layout: Auth user found:", user ? user.email : "No user")

      if (user) {
        // Get the user's profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url")
          .eq("id", user.id)
          .single()

        userData = {
          id: user.id,
          email: user.email,
          fullName: profile?.full_name || undefined,
          avatarUrl: profile?.avatar_url || undefined,
        }
        
        console.log("Using authenticated user:", userData.email)
      } else {
        console.log("No authenticated user found - showing guest view")
      }
    } catch (error) {
      console.error("Error getting user data:", error)
      // Continue with preview user data
    }
  }

  // Skip database initialization in development mode to avoid errors
  // In development mode, we assume the database has been set up already
  if (isDevelopment && process.env.INITIALIZE_DB === 'true') {
    console.log("Database initialization skipped - set INITIALIZE_DB=true to enable")
    // Uncomment this if you want to initialize the database
    // try {
    //   // Call the init-db API route to ensure tables are created
    //   const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/init-db`, {
    //     cache: "no-store",
    //   })
    //   const data = await response.json()
    //   console.log("Database initialization:", data.success ? "Success" : "Failed")
    // } catch (error) {
    //   console.error("Failed to initialize database:", error)
    // }
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
          <Header user={userData} />
          <main className="flex-1 p-4 md:p-6">
            {userData ? (
              // Show regular content for authenticated users
              children
            ) : (
              // Redirect to login - this is a fallback, middleware should handle this
              <div className="space-y-4">
                <div className="p-4 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-md">
                  <h2 className="text-lg font-semibold">Authentication Required</h2>
                  <p>You must be signed in to access the dashboard.</p>
                  <div className="mt-3">
                    <a href="/login" className="underline font-bold">Sign in now</a>
                  </div>
                </div>
                <script dangerouslySetInnerHTML={{ __html: `window.location.href = '/login';` }} />
              </div>
            )}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}

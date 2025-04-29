import type React from "react"
import { cookies } from "next/headers"

import { createServerClient } from "@/lib/supabase"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check if we're in preview mode without Supabase config
  const isMissingConfig = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Create mock user data for preview
  let userData = {
    id: "preview-user-id",
    email: "preview@example.com",
    fullName: "Preview User",
    avatarUrl: undefined,
  }

  // Only try to get real user data if we have Supabase configured
  if (!isMissingConfig) {
    try {
      const cookieStore = cookies()
      const supabase = createServerClient()

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

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
      }
    } catch (error) {
      console.error("Error getting user data:", error)
      // Continue with preview user data
    }
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen bg-background">
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        <div className="flex w-full flex-col">
          <Header user={userData} />
          <main className="flex-1 p-4 md:p-6">{children}</main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}

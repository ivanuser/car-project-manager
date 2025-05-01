import type React from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  return <div className="min-h-screen bg-background">{children}</div>
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { DemoHeader } from "@/components/demo/demo-header"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { DemoContent } from "@/components/demo/demo-content"
import { Button } from "@/components/ui/button"

export default function DemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen bg-background">
      <DemoHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex">
        <DemoSidebar isOpen={sidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 p-6 pt-20">
          <div className="fixed bottom-6 right-6 z-50">
            <Button size="lg" className="bg-primary text-white hover:bg-primary/90 shadow-lg" asChild>
              <Link href="/login">Sign Up Now</Link>
            </Button>
          </div>
          <DemoContent activeTab={activeTab} />
        </main>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { DemoHeader } from "@/components/demo/demo-header"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { DemoContent } from "@/components/demo/demo-content"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default function DemoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="min-h-screen bg-background">
      <DemoHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Sidebar */}
      <DemoSidebar isOpen={sidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} setIsOpen={setSidebarOpen} />

      {/* Floating menu button that appears when sidebar is closed */}
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-20 z-30 transition-opacity duration-300"
        style={{ opacity: sidebarOpen ? 0 : 1 }}
        onMouseEnter={() => setSidebarOpen(true)}
      >
        <Menu className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>

      {/* Main content - no margin adjustments */}
      <main className="ml-0 p-6 pt-20">
        <div className="fixed bottom-6 right-6 z-50">
          <Button size="lg" className="bg-primary text-white hover:bg-primary/90 shadow-lg" asChild>
            <Link href="/login">Sign Up Now</Link>
          </Button>
        </div>
        <DemoContent activeTab={activeTab} />
      </main>
    </div>
  )
}

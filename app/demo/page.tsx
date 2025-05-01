"use client"

import { useState } from "react"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { DemoContent } from "@/components/demo/demo-content"
import { DemoHeader } from "@/components/demo/demo-header"

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen flex-col">
      <DemoHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex flex-1">
        <div className="hidden md:block">
          <DemoSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
        <div className="relative flex-1 p-4 md:p-6">
          <DemoContent activeTab={activeTab} />
        </div>
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden">
            <div className="absolute left-0 top-0 h-full w-3/4 max-w-xs bg-background shadow-lg">
              <div className="flex h-16 items-center border-b px-6">
                <h2 className="text-lg font-semibold">CAJPRO Demo</h2>
                <button className="ml-auto text-muted-foreground" onClick={() => setSidebarOpen(false)}>
                  ✕
                </button>
              </div>
              <DemoSidebar
                activeTab={activeTab}
                onTabChange={(tab) => {
                  setActiveTab(tab)
                  setSidebarOpen(false)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

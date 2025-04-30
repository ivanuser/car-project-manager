"use client"

import { useState } from "react"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { DemoContent } from "@/components/demo/demo-content"
import { DemoHeader } from "@/components/demo/demo-header"

export default function DemoPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="flex min-h-screen flex-col">
      <DemoHeader sidebarOpen={isOpen} setSidebarOpen={setIsOpen} />
      <div className="flex flex-1 pt-16">
        <DemoSidebar isOpen={isOpen} activeTab={activeTab} setActiveTab={setActiveTab} setIsOpen={setIsOpen} />
        <main className="flex-1 p-4 md:p-6 overflow-x-hidden">
          <div className="max-w-full">
            <DemoContent activeTab={activeTab} />
          </div>
        </main>
      </div>
    </div>
  )
}

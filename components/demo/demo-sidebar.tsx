"use client"

import { BarChart3, Car, Cog, FileText, Home, Package, PenToolIcon as Tool, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface DemoSidebarProps {
  isOpen: boolean
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function DemoSidebar({ isOpen, activeTab, setActiveTab }: DemoSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "projects", label: "Projects", icon: Car },
    { id: "tasks", label: "Tasks", icon: FileText },
    { id: "parts", label: "Parts", icon: Tool },
    { id: "budget", label: "Budget", icon: BarChart3 },
    { id: "inventory", label: "Inventory", icon: Package },
    { id: "community", label: "Community", icon: Users },
    { id: "settings", label: "Settings", icon: Cog },
  ]

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-background transition-transform md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-16 items-center border-b px-6">
        <h2 className="text-lg font-semibold">CAJPRO Demo</h2>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-2">
          {menuItems.map((item) => (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "secondary" : "ghost"}
              className={cn("flex justify-start gap-3", activeTab === item.id && "bg-secondary/20")}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Button>
          ))}
        </nav>
        <Separator className="my-4" />
        <div className="px-4 py-2">
          <div className="rounded-lg bg-muted p-3">
            <h3 className="font-medium">Demo Version</h3>
            <p className="text-sm text-muted-foreground">This is a preview of CAJPRO. Sign up for full access.</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

"use client"
import { BarChart3, Car, Cog, FileText, Home, Package, PenToolIcon as Tool, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface DemoSidebarProps {
  isOpen: boolean
  activeTab: string
  setActiveTab: (tab: string) => void
  setIsOpen: (isOpen: boolean) => void
}

export function DemoSidebar({ isOpen, activeTab, setActiveTab, setIsOpen }: DemoSidebarProps) {
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

  // Handle mouse enter/leave for the entire sidebar
  const handleMouseEnter = () => {
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    setIsOpen(false)
  }

  return (
    <div className="fixed inset-y-0 left-0 z-20 w-64" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <aside
        className={cn(
          "h-full flex flex-col border-r bg-background transition-all duration-300",
          isOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-full pointer-events-none",
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
    </div>
  )
}

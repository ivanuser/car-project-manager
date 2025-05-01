"use client"
import {
  Calendar,
  ImageIcon,
  LayoutDashboard,
  Settings,
  PenToolIcon as Tool,
  Truck,
  Wrench,
  Receipt,
} from "lucide-react"

interface DemoSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DemoSidebar({ activeTab, onTabChange }: DemoSidebarProps) {
  return (
    <div className="flex h-full w-[240px] flex-col border-r bg-background">
      <div className="flex h-14 items-center border-b px-4">
        <span className="font-bold">CAJPRO</span>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          <button
            onClick={() => onTabChange("dashboard")}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              activeTab === "dashboard"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </button>

          <button
            onClick={() => onTabChange("projects")}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              activeTab === "projects"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Truck className="h-4 w-4" />
            Projects
          </button>

          <button
            onClick={() => onTabChange("tasks")}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              activeTab === "tasks"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Tool className="h-4 w-4" />
            Tasks
          </button>

          <button
            onClick={() => onTabChange("gallery")}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              activeTab === "gallery"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <ImageIcon className="h-4 w-4" />
            Gallery
          </button>

          <button
            onClick={() => onTabChange("timeline")}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              activeTab === "timeline"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Timeline
          </button>

          <button
            onClick={() => onTabChange("maintenance")}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              activeTab === "maintenance"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Wrench className="h-4 w-4" />
            Maintenance
          </button>

          <button
            onClick={() => onTabChange("expenses")}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              activeTab === "expenses"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Receipt className="h-4 w-4" />
            Expenses
          </button>

          <button
            onClick={() => onTabChange("settings")}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all ${
              activeTab === "settings"
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </nav>
      </div>
    </div>
  )
}

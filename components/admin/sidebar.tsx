"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Users,
  Settings,
  FileText,
  HardDrive,
  Shield,
  Bell,
  Database,
  BarChart4,
  Layers,
  Globe,
  Key,
  Wrench,
  Gauge,
} from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "System",
      href: "/admin/system",
      icon: Gauge,
    },
    {
      title: "Activity",
      href: "/admin/activity",
      icon: FileText,
    },
    {
      title: "Storage",
      href: "/admin/storage",
      icon: HardDrive,
    },
    {
      title: "Security",
      href: "/admin/security",
      icon: Shield,
    },
    {
      title: "Notifications",
      href: "/admin/notifications",
      icon: Bell,
    },
    {
      title: "Database",
      href: "/admin/database",
      icon: Database,
    },
    {
      title: "Analytics",
      href: "/admin/analytics",
      icon: BarChart4,
    },
    {
      title: "API Keys",
      href: "/admin/api-keys",
      icon: Key,
    },
    {
      title: "Integrations",
      href: "/admin/integrations",
      icon: Layers,
    },
    {
      title: "Domains",
      href: "/admin/domains",
      icon: Globe,
    },
    {
      title: "Maintenance",
      href: "/admin/maintenance",
      icon: Wrench,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="h-full py-8 space-y-4">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Admin Panel</h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                pathname === route.href ? "bg-primary/10 text-primary" : "text-muted-foreground",
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

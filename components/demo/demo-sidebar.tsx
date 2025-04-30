"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { BarChart3, Car, Cog, Home, Package, PenToolIcon as Tool, Wrench, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface NavItem {
  title: string
  icon: React.ElementType
  href: string
  isActive?: boolean
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/demo",
    isActive: true,
  },
  {
    title: "Projects",
    icon: Car,
    href: "/demo",
  },
  {
    title: "Tasks",
    icon: Wrench,
    href: "/demo",
  },
  {
    title: "Parts",
    icon: Tool,
    href: "/demo",
  },
  {
    title: "Inventory",
    icon: Package,
    href: "/demo",
  },
  {
    title: "Reports",
    icon: BarChart3,
    href: "/demo",
  },
  {
    title: "Settings",
    icon: Cog,
    href: "/demo",
  },
]

export function DemoSidebar() {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div
      className={cn(
        "relative h-full border-r bg-background transition-all duration-300 ease-in-out",
        isOpen ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/demo" className="flex items-center gap-2">
          {isOpen ? <span className="font-bold text-xl">CAJPRO</span> : <span className="font-bold text-xl">CJ</span>}
        </Link>
        <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setIsOpen(!isOpen)}>
          <X className="h-4 w-4" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-3.5rem)]">
        <div className="px-2 py-2">
          <nav className="grid gap-1">
            {navItems.map((item, index) => (
              <Button
                key={index}
                variant={item.isActive ? "secondary" : "ghost"}
                className={cn("flex items-center gap-3 justify-start", !isOpen && "justify-center px-0")}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4" />
                  {isOpen && <span>{item.title}</span>}
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </ScrollArea>
    </div>
  )
}

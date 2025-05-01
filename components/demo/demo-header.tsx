"use client"

import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface DemoHeaderProps {
  onMenuClick: () => void
}

export function DemoHeader({ onMenuClick }: DemoHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Button variant="outline" size="icon" className="md:hidden" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </Button>
      <div className="flex items-center gap-2">
        <span className="font-bold">CAJPRO</span>
        <span className="rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium">Demo</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <Button size="sm">Sign Up</Button>
      </div>
    </header>
  )
}

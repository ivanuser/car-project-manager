"use client"

import { Bell, Menu, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"

interface DemoHeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export function DemoHeader({ sidebarOpen, setSidebarOpen }: DemoHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <div className="hidden md:block">
          <Logo />
        </div>
      </div>
      <div className="flex-1 md:flex md:justify-center">
        <div className="relative hidden w-full max-w-sm md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-2 w-2 rounded-full bg-primary"></span>
          <span className="sr-only">Notifications</span>
        </Button>
        <Avatar className="h-8 w-8">
          <AvatarFallback>DE</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}

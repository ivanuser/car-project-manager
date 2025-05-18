"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bell, Menu, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { signOut } from "@/actions/auth-actions"
import { ThemeToggle } from "@/components/theme-toggle"
import { BackgroundToggle } from "@/components/background-toggle"
import { useToast } from "@/hooks/use-toast"

interface HeaderProps {
  user?: {
    id: string
    email?: string
    fullName?: string
    avatarUrl?: string
  }
}

export function Header({ user }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)
  
  // Handle null user
  const displayName = user?.email || "Guest"
  
  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "G"

  // Handle background intensity change
  const handleBackgroundToggle = (intensity: "none" | "light" | "medium" | "strong" | "max") => {
    // Find the gradient background element and update its class
    const gradientEl = document.querySelector("[data-gradient-background]")
    if (gradientEl) {
      // Remove all intensity classes
      gradientEl.classList.remove("opacity-0", "opacity-30", "opacity-50", "opacity-70", "opacity-90")

      // Add the appropriate class based on intensity
      if (intensity === "none") {
        gradientEl.classList.add("opacity-0")
      } else if (intensity === "light") {
        gradientEl.classList.add("opacity-30")
      } else if (intensity === "medium") {
        gradientEl.classList.add("opacity-50")
      } else if (intensity === "strong") {
        gradientEl.classList.add("opacity-70")
      } else if (intensity === "max") {
        gradientEl.classList.add("opacity-90")
      }
    }

    toast({
      title: "Background Updated",
      description: `Background intensity set to ${intensity}`,
      duration: 2000,
    })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <DashboardSidebar />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <h1 className="text-xl font-semibold md:text-2xl">CAJPRO</h1>
      </div>

      <div className="flex items-center gap-4">
        <BackgroundToggle onToggle={handleBackgroundToggle} defaultIntensity="strong" />
        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar>
                <AvatarImage src={user?.avatarUrl || ""} alt={user?.fullName || user?.email || ""} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={async (e) => {
                e.preventDefault()
                setIsSigningOut(true)
                try {
                  const result = await signOut()
                  if (result.success) {
                    router.push(result.redirectUrl || '/login')
                  }
                } catch (error) {
                  console.error('Error signing out:', error)
                  toast({
                    title: 'Error',
                    description: 'Failed to sign out. Please try again.',
                    variant: 'destructive',
                  })
                } finally {
                  setIsSigningOut(false)
                }
              }}
              className="text-destructive focus:text-destructive"
              disabled={isSigningOut}
            >
              {isSigningOut ? 'Signing out...' : 'Sign out'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button asChild size="sm" className="hidden md:flex">
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>
    </header>
  )
}

"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  // const { theme, setTheme } = useTheme()

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0">
              <Logo size="md" />
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              <Link
                href="/#features"
                className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
              >
                Features
              </Link>
              <Link
                href="/#how-it-works"
                className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
              >
                How It Works
              </Link>
              <Link
                href="/#pricing"
                className="text-foreground/80 hover:text-foreground px-3 py-2 rounded-md text-sm font-medium"
              >
                Pricing
              </Link>
              <ThemeToggle className="ml-2" />
            </div>
          </div>

          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark"
              >
                <Link href="/login?tab=register">Get Started</Link>
              </Button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <ThemeToggle className="mr-2" />
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              <span className="sr-only">Open menu</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-background border-b">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/#features"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/#how-it-works"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/#pricing"
              className="block px-3 py-2 rounded-md text-base font-medium text-foreground/80 hover:text-foreground hover:bg-muted"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t">
            <div className="px-2 space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  Login
                </Link>
              </Button>
              <Button
                className="w-full bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark"
                asChild
              >
                <Link href="/login?tab=register" onClick={() => setIsMenuOpen(false)}>
                  Get Started
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

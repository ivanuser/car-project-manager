"use client"

import * as React from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // After mounting, we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch by not rendering anything until client-side
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={className} disabled>
        <span className="sr-only">Toggle theme</span>
        <div className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={className}
    >
      <span className="sr-only">Toggle theme</span>
      <div className="relative h-5 w-5">
        <SunIcon className={`absolute transition-opacity ${theme === "dark" ? "opacity-100" : "opacity-0"}`} />
        <MoonIcon className={`absolute transition-opacity ${theme === "dark" ? "opacity-0" : "opacity-100"}`} />
      </div>
    </Button>
  )
}

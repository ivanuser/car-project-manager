"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface GradientBackgroundProps {
  className?: string
  intensity?: "light" | "medium" | "strong" | "max"
}

export function GradientBackground({ className = "", intensity = "medium" }: GradientBackgroundProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Only render the gradient after component mounts to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Determine opacity based on intensity - increased values for better visibility
  const opacityClass = {
    light: "opacity-30",
    medium: "opacity-50",
    strong: "opacity-70",
    max: "opacity-90",
  }[intensity]

  // Determine colors based on theme
  const isDark = theme === "dark"

  return (
    <div
      data-gradient-background
      className={`fixed inset-0 -z-10 pointer-events-none ${opacityClass} ${className}`}
      aria-hidden="true"
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          background: isDark
            ? "linear-gradient(125deg, rgba(79, 70, 229, 0.8) 0%, transparent 40%), linear-gradient(225deg, rgba(109, 40, 217, 0.8) 0%, transparent 40%), linear-gradient(315deg, rgba(139, 92, 246, 0.8) 0%, transparent 40%)"
            : "linear-gradient(125deg, rgba(96, 165, 250, 0.8) 0%, transparent 40%), linear-gradient(225deg, rgba(109, 40, 217, 0.8) 0%, transparent 40%), linear-gradient(315deg, rgba(147, 197, 253, 0.8) 0%, transparent 40%)",
        }}
      >
        <div
          className="absolute inset-0 animate-pulse-slow"
          style={{
            background: isDark
              ? "linear-gradient(225deg, rgba(79, 70, 229, 0.8) 0%, transparent 40%), linear-gradient(315deg, rgba(109, 40, 217, 0.8) 0%, transparent 40%), linear-gradient(45deg, rgba(139, 92, 246, 0.8) 0%, transparent 40%)"
              : "linear-gradient(225deg, rgba(96, 165, 250, 0.8) 0%, transparent 40%), linear-gradient(315deg, rgba(109, 40, 217, 0.8) 0%, transparent 40%), linear-gradient(45deg, rgba(147, 197, 253, 0.8) 0%, transparent 40%)",
          }}
        />
      </div>
    </div>
  )
}

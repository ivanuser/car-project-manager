"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Layers, Layers3, X } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface BackgroundToggleProps {
  onToggle: (intensity: "none" | "light" | "medium" | "strong" | "max") => void
  defaultIntensity?: "none" | "light" | "medium" | "strong" | "max"
}

export function BackgroundToggle({ onToggle, defaultIntensity = "strong" }: BackgroundToggleProps) {
  const [intensity, setIntensity] = useState<"none" | "light" | "medium" | "strong" | "max">(defaultIntensity)

  const handleToggle = (newIntensity: "none" | "light" | "medium" | "strong" | "max") => {
    setIntensity(newIntensity)
    onToggle(newIntensity)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" title="Background settings">
          {intensity === "none" ? (
            <X size={16} />
          ) : intensity === "light" ? (
            <Layers size={16} />
          ) : intensity === "medium" ? (
            <Layers size={16} />
          ) : intensity === "strong" ? (
            <Layers3 size={16} />
          ) : (
            <Layers3 size={16} className="text-primary" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleToggle("none")}>No Background</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggle("light")}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggle("medium")}>Medium</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggle("strong")}>Strong</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleToggle("max")}>Maximum</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

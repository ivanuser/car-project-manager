"use client"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

interface ThemeColorPickerProps {
  value: string
  onChange: (value: string) => void
}

const colorOptions = [
  {
    name: "Default",
    value: "default",
    color: "#000000",
  },
  {
    name: "Blue",
    value: "blue",
    color: "#2563eb",
  },
  {
    name: "Green",
    value: "green",
    color: "#16a34a",
  },
  {
    name: "Purple",
    value: "purple",
    color: "#9333ea",
  },
  {
    name: "Orange",
    value: "orange",
    color: "#ea580c",
  },
]

export function ThemeColorPicker({ value, onChange }: ThemeColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {colorOptions.map((option) => (
        <button
          key={option.value}
          className={cn(
            "relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
            value === option.value ? "border-black dark:border-white" : "border-transparent",
          )}
          style={{ backgroundColor: option.color }}
          onClick={() => onChange(option.value)}
          type="button"
          title={option.name}
        >
          {value === option.value && <Check className="h-4 w-4 text-white" />}
          <span className="sr-only">{option.name}</span>
        </button>
      ))}
    </div>
  )
}

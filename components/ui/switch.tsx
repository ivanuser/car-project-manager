"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(({ className, ...props }, ref) => {
  return (
    <label
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        props.checked ? "bg-primary" : "bg-input",
        className,
      )}
    >
      <input type="checkbox" className="peer sr-only" ref={ref} {...props} />
      <span
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          props.checked ? "translate-x-5" : "translate-x-0",
        )}
        aria-hidden="true"
      />
    </label>
  )
})

Switch.displayName = "Switch"

export { Switch }

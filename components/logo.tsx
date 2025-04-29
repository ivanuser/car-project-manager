import { Car } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg"
  showText?: boolean
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark via-secondary to-accent blur-sm opacity-70 rounded-full" />
        <Car className={cn("relative text-white", sizes[size])} />
      </div>
      {showText && <span className={cn("font-bold gradient-text", textSizes[size])}>CAJPRO</span>}
    </div>
  )
}

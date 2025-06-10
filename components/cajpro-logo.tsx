"use client"

import Link from "next/link"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export function CajproLogo({ size = "md", className = "" }: LogoProps) {
  // Determine size classes
  const sizeClasses = {
    sm: "h-8",
    md: "h-12",
    lg: "h-16",
  }[size]
  
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="inline-flex items-center gap-2">
        <div className="relative">
          <svg 
            viewBox="0 0 60 34" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={sizeClasses}
          >
            <path 
              d="M55 17H5C2.23858 17 0 14.7614 0 12V9C0 6.23858 2.23858 4 5 4H55C57.7614 4 60 6.23858 60 9V12C60 14.7614 57.7614 17 55 17Z" 
              fill="#4338CA"
            />
            <path 
              d="M55 30H5C2.23858 30 0 27.7614 0 25V22C0 19.2386 2.23858 17 5 17H55C57.7614 17 60 19.2386 60 22V25C60 27.7614 57.7614 30 55 30Z" 
              fill="#6366F1"
            />
            <circle cx="16" cy="10.5" r="4.5" fill="white" />
            <circle cx="44" cy="10.5" r="4.5" fill="white" />
            <circle cx="16" cy="23.5" r="4.5" fill="white" />
            <circle cx="44" cy="23.5" r="4.5" fill="white" />
          </svg>
        </div>
        <span className="text-2xl md:text-3xl font-bold text-white tracking-tight">CAJPRO</span>
      </div>
    </div>
  )
}

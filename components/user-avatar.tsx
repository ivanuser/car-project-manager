"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Interface for the component props
interface UserAvatarProps {
  src?: string | null
  alt?: string
  fallback?: string
  className?: string
}

/**
 * UserAvatar component that handles migration from Supabase to local storage
 * This component will convert old Supabase URLs to the new API endpoint
 */
export function UserAvatar({ src, alt = "User", fallback = "U", className }: UserAvatarProps) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined)
  
  useEffect(() => {
    // Handle URL conversion if needed
    if (src) {
      // Check if this is an old Supabase URL
      if (
        src.includes("storage/avatars") || 
        src.includes("storage.googleapis.com") || 
        src.includes("supabase.co")
      ) {
        // Extract the filename from the URL
        const urlParts = src.split('/')
        const filename = urlParts[urlParts.length - 1]
        
        // Use our new API endpoint
        setImageUrl(`/api/storage/avatars/${filename}`)
      } else {
        // Use the provided URL as is
        setImageUrl(src)
      }
    } else {
      // Use placeholder if no src is provided
      setImageUrl("/api/storage/avatars/placeholder")
    }
  }, [src])
  
  // Get initials for the fallback
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }
  
  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl} alt={alt} />
      <AvatarFallback>{fallback || getInitials(alt)}</AvatarFallback>
    </Avatar>
  )
}

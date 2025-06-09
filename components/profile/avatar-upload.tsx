"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Camera, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
// import { updateAvatar } from "@/actions/profile-actions" // Using API endpoint instead
import { useToast } from "@/hooks/use-toast"
import { UserAvatar } from "@/components/user-avatar"

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  userId: string
}

export function AvatarUpload({ currentAvatarUrl, userId }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const [processedAvatarUrl, setProcessedAvatarUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Convert old Supabase URLs to new API endpoints
  useEffect(() => {
    // Handle URL conversion if needed
    if (currentAvatarUrl) {
      // Check if this is an old Supabase URL
      if (
        currentAvatarUrl.includes("storage/avatars") || 
        currentAvatarUrl.includes("storage.googleapis.com") || 
        currentAvatarUrl.includes("supabase.co")
      ) {
        // Extract the filename from the URL
        const urlParts = currentAvatarUrl.split('/')
        const filename = urlParts[urlParts.length - 1]
        
        // Use our new API endpoint
        const newUrl = `/api/storage/avatars/${filename}`
        setProcessedAvatarUrl(newUrl)
        setPreviewUrl(newUrl)
      } else {
        // Use the provided URL as is
        setProcessedAvatarUrl(currentAvatarUrl)
        setPreviewUrl(currentAvatarUrl)
      }
    } else {
      setProcessedAvatarUrl(null)
      setPreviewUrl(null)
    }
  }, [currentAvatarUrl])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      })
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    // Create a preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload the file
    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append("avatar", file)

      console.log("AvatarUpload: Uploading file to API endpoint")
      
      const response = await fetch('/api/uploads/avatars', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      console.log("AvatarUpload: Upload successful:", result)

      if (result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        })
        // Revert to previous avatar
        setPreviewUrl(processedAvatarUrl || currentAvatarUrl)
      } else {
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated",
        })
        // Update preview with the new URL from the server
        setPreviewUrl(result.avatarUrl)
        setProcessedAvatarUrl(result.avatarUrl)
        
        // Refresh the page to update the profile data
        window.location.reload()
      }
    } catch (error) {
      console.error("Avatar upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
      // Revert to previous avatar
      setPreviewUrl(processedAvatarUrl || currentAvatarUrl)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return

    setIsUploading(true)

    try {
      const formData = new FormData()
      // Create an empty file to clear the avatar
      const emptyFile = new File([""], "empty.txt", { type: "text/plain" })
      formData.append("avatar", emptyFile)
      formData.append("remove", "true")

      console.log("AvatarUpload: Removing avatar via API endpoint")
      
      const response = await fetch('/api/uploads/avatars', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Remove failed')
      }

      const result = await response.json()
      console.log("AvatarUpload: Remove successful:", result)

      if (result.error) {
        toast({
          title: "Failed to remove avatar",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Avatar removed",
          description: "Your profile picture has been removed",
        })
        setPreviewUrl(null)
        setProcessedAvatarUrl(null)
        
        // Refresh the page to update the profile data
        window.location.reload()
      }
    } catch (error) {
      console.error("Avatar removal error:", error)
      toast({
        title: "Failed to remove avatar",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const triggerFileInput = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <div className="h-32 w-32 overflow-hidden rounded-full border-2 border-border bg-muted">
          {previewUrl ? (
            <div className="h-full w-full">
              <Image
                src={previewUrl}
                alt="Profile avatar"
                width={128}
                height={128}
                className="h-full w-full object-cover"
                onError={() => {
                  // If image fails to load, fall back to API endpoint or initials
                  if (processedAvatarUrl && previewUrl !== processedAvatarUrl) {
                    setPreviewUrl(processedAvatarUrl)
                  } else {
                    setPreviewUrl(null)
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted text-4xl font-bold text-muted-foreground">
              {userId.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" onClick={triggerFileInput} disabled={isUploading}>
          <Camera className="mr-2 h-4 w-4" />
          Change Photo
        </Button>
        {previewUrl && (
          <Button type="button" variant="outline" size="sm" onClick={handleRemoveAvatar} disabled={isUploading}>
            <X className="mr-2 h-4 w-4" />
            Remove
          </Button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        disabled={isUploading}
      />

      <p className="text-xs text-muted-foreground">Recommended: Square image, max 5MB</p>
    </div>
  )
}

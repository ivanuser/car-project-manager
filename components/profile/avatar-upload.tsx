"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Camera, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { updateAvatar } from "@/actions/profile-actions"
import { useToast } from "@/hooks/use-toast"

interface AvatarUploadProps {
  currentAvatarUrl: string | null
  userId: string
}

export function AvatarUpload({ currentAvatarUrl, userId }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

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

      const result = await updateAvatar(formData)

      if (result.error) {
        toast({
          title: "Upload failed",
          description: result.error,
          variant: "destructive",
        })
        // Revert to previous avatar
        setPreviewUrl(currentAvatarUrl)
      } else {
        toast({
          title: "Avatar updated",
          description: "Your profile picture has been updated",
        })
        // Update preview with the new URL from the server
        setPreviewUrl(result.avatarUrl)
      }
    } catch (error) {
      console.error("Avatar upload error:", error)
      toast({
        title: "Upload failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      // Revert to previous avatar
      setPreviewUrl(currentAvatarUrl)
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

      const result = await updateAvatar(formData)

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
      }
    } catch (error) {
      console.error("Avatar removal error:", error)
      toast({
        title: "Failed to remove avatar",
        description: "An unexpected error occurred",
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
            <Image
              src={previewUrl || "/placeholder.svg"}
              alt="Profile avatar"
              width={128}
              height={128}
              className="h-full w-full object-cover"
            />
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

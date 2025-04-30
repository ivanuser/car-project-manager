"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { uploadProjectPhoto } from "@/actions/gallery-actions"

interface PhotoUploadFormProps {
  projectId: string
  onSuccess?: () => void
}

const PHOTO_CATEGORIES = [
  { value: "general", label: "General" },
  { value: "exterior", label: "Exterior" },
  { value: "interior", label: "Interior" },
  { value: "engine", label: "Engine" },
  { value: "suspension", label: "Suspension" },
  { value: "wheels", label: "Wheels & Tires" },
  { value: "electrical", label: "Electrical" },
  { value: "body", label: "Body Work" },
  { value: "paint", label: "Paint" },
  { value: "detail", label: "Detail" },
]

export function PhotoUploadForm({ projectId, onSuccess }: PhotoUploadFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photo, setPhoto] = useState<File | null>(null)
  const [takenDate, setTakenDate] = useState<Date | undefined>()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhoto(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setPhoto(null)
    setPhotoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!photo) {
      toast({
        title: "Photo Required",
        description: "Please select a photo to upload",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("project_id", projectId)

      if (takenDate) {
        formData.append("taken_at", takenDate.toISOString())
      }

      const result = await uploadProjectPhoto(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Photo uploaded successfully",
        })

        // Reset form
        setPhoto(null)
        setPhotoPreview(null)
        setTakenDate(undefined)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        // Call success callback if provided
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (error) {
      console.error("Photo upload error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Photo</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo</Label>
            <div className="flex flex-col items-center">
              {photoPreview ? (
                <div className="relative w-full h-64 mb-4">
                  <img
                    src={photoPreview || "/placeholder.svg"}
                    alt="Photo preview"
                    className="w-full h-full object-contain rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={removePhoto}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div
                  className="w-full h-64 border-2 border-dashed rounded-md flex flex-col items-center justify-center mb-4 bg-muted/50 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Click to select a photo</p>
                  <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF up to 10MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                name="photo"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className={cn(photoPreview ? "hidden" : "block")}
              >
                Select Photo
              </Button>
            </div>
          </div>

          {/* Photo Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title (Optional)</Label>
              <Input id="title" name="title" placeholder="e.g. Front Quarter View" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue="general">
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PHOTO_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea id="description" name="description" placeholder="Add details about this photo..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Date Taken (Optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !takenDate && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {takenDate ? format(takenDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={takenDate} onSelect={setTakenDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-4">
            <Label>Photo Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="is_before" name="is_before" value="true" />
                <Label htmlFor="is_before" className="font-normal">
                  Before Photo (for before/after comparison)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="is_after" name="is_after" value="true" />
                <Label htmlFor="is_after" className="font-normal">
                  After Photo (for before/after comparison)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="is_featured" name="is_featured" value="true" />
                <Label htmlFor="is_featured" className="font-normal">
                  Featured Photo (display prominently)
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !photo}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload Photo"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

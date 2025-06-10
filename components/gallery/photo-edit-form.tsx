"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { CalendarIcon, Loader2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { updatePhotoDetails, deletePhoto, getUserTags } from "@/actions/gallery-actions"

interface PhotoEditFormProps {
  photo: any
  projectId: string
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

export function PhotoEditForm({ photo, projectId }: PhotoEditFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [takenDate, setTakenDate] = useState<Date | undefined>(photo.taken_at ? new Date(photo.taken_at) : undefined)
  const [availableTags, setAvailableTags] = useState<any[]>([])
  const [selectedTags, setSelectedTags] = useState<any[]>(photo.tags || [])
  const [tagInput, setTagInput] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const loadTags = async () => {
      const tags = await getUserTags()
      setAvailableTags(tags)
    }
    loadTags()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      formData.append("project_id", projectId)

      if (takenDate) {
        formData.append("taken_at", takenDate.toISOString())
      }

      // Add tags
      formData.append("tags", JSON.stringify(selectedTags))

      const result = await updatePhotoDetails(photo.id, formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Photo updated successfully",
        })
        router.push(`/dashboard/projects/${projectId}?tab=gallery`)
        router.refresh()
      }
    } catch (error) {
      console.error("Photo update error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeletePhoto = async () => {
    setIsDeleting(true)
    try {
      const result = await deletePhoto(photo.id, projectId)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Photo deleted successfully",
        })
        router.push(`/dashboard/projects/${projectId}?tab=gallery`)
        router.refresh()
      }
    } catch (error) {
      console.error("Photo deletion error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const addTag = () => {
    if (!tagInput.trim()) return

    // Check if tag already exists in available tags
    const existingTag = availableTags.find((tag) => tag.name.toLowerCase() === tagInput.toLowerCase())

    if (existingTag) {
      // Check if tag is already selected
      if (!selectedTags.some((tag) => tag.id === existingTag.id)) {
        setSelectedTags([...selectedTags, existingTag])
      }
    } else {
      // Add new tag
      const newTag = { id: null, name: tagInput.trim() }
      setSelectedTags([...selectedTags, newTag])
    }

    setTagInput("")
  }

  const removeTag = (tagToRemove: any) => {
    setSelectedTags(selectedTags.filter((tag) => (tag.id ? tag.id !== tagToRemove.id : tag.name !== tagToRemove.name)))
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Edit Photo</CardTitle>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Delete Photo</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the photo from your project.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePhoto}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {/* Photo Preview */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md h-64">
              <Image
                src={photo.photo_url || "/placeholder.svg"}
                alt={photo.title || "Photo"}
                fill
                className="object-contain rounded-md"
              />
            </div>
          </div>

          {/* Photo Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={photo.title || ""} placeholder="e.g. Front Quarter View" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={photo.category || "general"}>
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={photo.description || ""}
              placeholder="Add details about this photo..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Date Taken</Label>
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

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Add tags..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag} size="sm">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {selectedTags.map((tag, index) => (
                <Badge key={tag.id || `new-${index}`} variant="secondary" className="flex items-center gap-1">
                  {tag.name}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => removeTag(tag)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
              {selectedTags.length === 0 && <p className="text-sm text-muted-foreground">No tags added</p>}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Photo Type</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="is_before" name="is_before" value="true" defaultChecked={photo.is_before_photo} />
                <Label htmlFor="is_before" className="font-normal">
                  Before Photo (for before/after comparison)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="is_after" name="is_after" value="true" defaultChecked={photo.is_after_photo} />
                <Label htmlFor="is_after" className="font-normal">
                  After Photo (for before/after comparison)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="is_featured" name="is_featured" value="true" defaultChecked={photo.is_featured} />
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
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

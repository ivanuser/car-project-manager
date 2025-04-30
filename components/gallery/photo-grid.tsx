"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { Camera, Calendar, Grid3X3, LayoutGrid, Maximize2, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Photo {
  id: string
  title: string | null
  description: string | null
  photo_url: string
  thumbnail_url: string
  category: string
  is_before_photo: boolean
  is_after_photo: boolean
  is_featured: boolean
  taken_at: string | null
  created_at: string
  tags?: { id: string; name: string }[]
}

interface PhotoGridProps {
  photos: Photo[]
  projectId: string
}

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  exterior: "Exterior",
  interior: "Interior",
  engine: "Engine",
  suspension: "Suspension",
  wheels: "Wheels & Tires",
  electrical: "Electrical",
  body: "Body Work",
  paint: "Paint",
  detail: "Detail",
}

export function PhotoGrid({ photos, projectId }: PhotoGridProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  // Filter photos by category
  const filteredPhotos = activeCategory === "all" ? photos : photos.filter((photo) => photo.category === activeCategory)

  // Get unique categories from photos
  const categories = ["all", ...new Set(photos.map((photo) => photo.category))]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={(value) => setActiveCategory(value)}>
          <TabsList className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {categories
              .filter((cat) => cat !== "all")
              .sort()
              .map((category) => (
                <TabsTrigger key={category} value={category}>
                  {CATEGORY_LABELS[category] || category}
                </TabsTrigger>
              ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button asChild>
            <Link href={`/dashboard/projects/${projectId}/gallery/upload`}>
              <Camera className="mr-2 h-4 w-4" />
              Add Photo
            </Link>
          </Button>
        </div>
      </div>

      {filteredPhotos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Camera className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No photos in this category</p>
            <Button asChild>
              <Link href={`/dashboard/projects/${projectId}/gallery/upload`}>Add Your First Photo</Link>
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden group">
              <div className="relative aspect-square">
                <Image
                  src={photo.thumbnail_url || photo.photo_url}
                  alt={photo.title || "Project photo"}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button variant="secondary" size="icon" className="h-9 w-9" onClick={() => setSelectedPhoto(photo)}>
                    <Maximize2 className="h-5 w-5" />
                  </Button>
                </div>
                {(photo.is_before_photo || photo.is_after_photo) && (
                  <div className="absolute top-2 left-2">
                    <Badge variant={photo.is_before_photo ? "destructive" : "default"}>
                      {photo.is_before_photo ? "Before" : "After"}
                    </Badge>
                  </div>
                )}
              </div>
              <CardFooter className="p-2">
                <div className="w-full">
                  <h3 className="text-sm font-medium truncate">{photo.title || "Untitled"}</h3>
                  <p className="text-xs text-muted-foreground">{format(new Date(photo.created_at), "MMM d, yyyy")}</p>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPhotos.map((photo) => (
            <Card key={photo.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <div className="relative w-full sm:w-48 h-48">
                  <Image
                    src={photo.thumbnail_url || photo.photo_url}
                    alt={photo.title || "Project photo"}
                    fill
                    className="object-cover"
                  />
                  {(photo.is_before_photo || photo.is_after_photo) && (
                    <div className="absolute top-2 left-2">
                      <Badge variant={photo.is_before_photo ? "destructive" : "default"}>
                        {photo.is_before_photo ? "Before" : "After"}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                    <div>
                      <h3 className="text-lg font-medium">{photo.title || "Untitled"}</h3>
                      <div className="flex items-center text-sm text-muted-foreground gap-2 mt-1">
                        <Badge variant="outline">{CATEGORY_LABELS[photo.category] || photo.category}</Badge>
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {format(new Date(photo.created_at), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/dashboard/photos/${photo.id}`}>Edit</Link>
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setSelectedPhoto(photo)}>
                        View
                      </Button>
                    </div>
                  </div>
                  {photo.description && <p className="text-sm mt-2 line-clamp-2">{photo.description}</p>}
                  {photo.tags && photo.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <Tag className="h-3 w-3 text-muted-foreground" />
                      <div className="flex flex-wrap gap-1">
                        {photo.tags.map((tag) => (
                          <Badge key={tag.id} variant="secondary" className="text-xs">
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.title || "Photo Detail"}</DialogTitle>
            <DialogDescription>
              {selectedPhoto?.category && (
                <Badge variant="outline" className="mr-2">
                  {CATEGORY_LABELS[selectedPhoto.category] || selectedPhoto.category}
                </Badge>
              )}
              {selectedPhoto?.taken_at ? (
                <span className="text-muted-foreground text-sm">
                  Taken on {format(new Date(selectedPhoto.taken_at), "PPP")}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">
                  Added on {selectedPhoto && format(new Date(selectedPhoto.created_at), "PPP")}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full" style={{ height: "calc(80vh - 200px)" }}>
            {selectedPhoto && (
              <Image
                src={selectedPhoto.photo_url || "/placeholder.svg"}
                alt={selectedPhoto.title || "Project photo"}
                fill
                className="object-contain"
              />
            )}
          </div>
          <ScrollArea className="max-h-32">
            {selectedPhoto?.description && <p className="text-sm">{selectedPhoto.description}</p>}
            {selectedPhoto?.tags && selectedPhoto.tags.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <Tag className="h-3 w-3 text-muted-foreground" />
                <div className="flex flex-wrap gap-1">
                  {selectedPhoto.tags.map((tag) => (
                    <Badge key={tag.id} variant="secondary" className="text-xs">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href={`/dashboard/photos/${selectedPhoto?.id}`}>Edit Photo</Link>
            </Button>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

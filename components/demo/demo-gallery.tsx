"use client"

import { useState } from "react"
import Image from "next/image"
import { Camera, Calendar, Grid3X3, LayoutGrid, Maximize2, Tag } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"

// Sample gallery data
const DEMO_PHOTOS = [
  {
    id: "1",
    title: "Engine Bay Before Restoration",
    description: "Original condition of the engine bay before any work was done.",
    photo_url: "/vintage-engine-bay-rusty.png",
    thumbnail_url: "/vintage-engine-bay-rusty.png",
    category: "engine",
    is_before_photo: true,
    is_after_photo: false,
    is_featured: true,
    taken_at: "2023-01-15T12:00:00Z",
    created_at: "2023-01-15T12:00:00Z",
    tags: [
      { id: "1", name: "engine" },
      { id: "2", name: "restoration" },
    ],
  },
  {
    id: "2",
    title: "Engine Bay After Restoration",
    description: "Fully restored engine bay with new components and fresh paint.",
    photo_url: "/restored-vintage-engine-bay.png",
    thumbnail_url: "/restored-vintage-engine-bay.png",
    category: "engine",
    is_before_photo: false,
    is_after_photo: true,
    is_featured: true,
    taken_at: "2023-06-20T14:30:00Z",
    created_at: "2023-06-20T14:30:00Z",
    tags: [
      { id: "1", name: "engine" },
      { id: "2", name: "restoration" },
      { id: "3", name: "completed" },
    ],
  },
  {
    id: "3",
    title: "Original Paint Condition",
    description: "Original paint showing significant wear and oxidation.",
    photo_url: "/vintage-car-faded-paint.png",
    thumbnail_url: "/vintage-car-faded-paint.png",
    category: "exterior",
    is_before_photo: true,
    is_after_photo: false,
    is_featured: false,
    taken_at: "2023-01-10T10:15:00Z",
    created_at: "2023-01-10T10:15:00Z",
    tags: [
      { id: "4", name: "paint" },
      { id: "5", name: "exterior" },
    ],
  },
  {
    id: "4",
    title: "Fresh Paint Job",
    description: "New candy apple red paint with clear coat finish.",
    photo_url: "/vintage-red-car.png",
    thumbnail_url: "/vintage-red-car.png",
    category: "exterior",
    is_before_photo: false,
    is_after_photo: true,
    is_featured: true,
    taken_at: "2023-07-05T16:45:00Z",
    created_at: "2023-07-05T16:45:00Z",
    tags: [
      { id: "4", name: "paint" },
      { id: "5", name: "exterior" },
      { id: "3", name: "completed" },
    ],
  },
  {
    id: "5",
    title: "Original Interior",
    description: "Worn out interior with damaged upholstery.",
    photo_url: "/vintage-car-worn-interior.png",
    thumbnail_url: "/vintage-car-worn-interior.png",
    category: "interior",
    is_before_photo: true,
    is_after_photo: false,
    is_featured: false,
    taken_at: "2023-01-12T11:30:00Z",
    created_at: "2023-01-12T11:30:00Z",
    tags: [
      { id: "6", name: "interior" },
      { id: "7", name: "upholstery" },
    ],
  },
  {
    id: "6",
    title: "Restored Interior",
    description: "Completely reupholstered interior with new carpet and dashboard.",
    photo_url: "/placeholder.svg?height=800&width=1200&query=vintage car restored leather interior",
    thumbnail_url: "/placeholder.svg?height=400&width=600&query=vintage car restored leather interior",
    category: "interior",
    is_before_photo: false,
    is_after_photo: true,
    is_featured: false,
    taken_at: "2023-08-18T13:20:00Z",
    created_at: "2023-08-18T13:20:00Z",
    tags: [
      { id: "6", name: "interior" },
      { id: "7", name: "upholstery" },
      { id: "3", name: "completed" },
    ],
  },
  {
    id: "7",
    title: "Suspension Components",
    description: "New suspension components ready for installation.",
    photo_url: "/placeholder.svg?height=800&width=1200&query=car suspension components",
    thumbnail_url: "/placeholder.svg?height=400&width=600&query=car suspension components",
    category: "suspension",
    is_before_photo: false,
    is_after_photo: false,
    is_featured: false,
    taken_at: "2023-03-25T09:10:00Z",
    created_at: "2023-03-25T09:10:00Z",
    tags: [
      { id: "8", name: "suspension" },
      { id: "9", name: "parts" },
    ],
  },
  {
    id: "8",
    title: "New Wheels Installed",
    description: "Custom wheels with performance tires installed.",
    photo_url: "/placeholder.svg?height=800&width=1200&query=vintage car custom wheels",
    thumbnail_url: "/placeholder.svg?height=400&width=600&query=vintage car custom wheels",
    category: "wheels",
    is_before_photo: false,
    is_after_photo: false,
    is_featured: true,
    taken_at: "2023-05-30T15:40:00Z",
    created_at: "2023-05-30T15:40:00Z",
    tags: [
      { id: "10", name: "wheels" },
      { id: "11", name: "tires" },
      { id: "3", name: "completed" },
    ],
  },
]

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

export function DemoGallery() {
  const [selectedPhoto, setSelectedPhoto] = useState<(typeof DEMO_PHOTOS)[0] | null>(null)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [activeCategory, setActiveCategory] = useState<string>("all")

  // Filter photos by category
  const filteredPhotos =
    activeCategory === "all" ? DEMO_PHOTOS : DEMO_PHOTOS.filter((photo) => photo.category === activeCategory)

  // Get unique categories from photos
  const categories = ["all", ...new Set(DEMO_PHOTOS.map((photo) => photo.category))]

  // Get before and after photos for comparison
  const beforePhotos = DEMO_PHOTOS.filter((photo) => photo.is_before_photo)
  const afterPhotos = DEMO_PHOTOS.filter((photo) => photo.is_after_photo)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="all-photos" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-photos">All Photos</TabsTrigger>
          <TabsTrigger value="before-after">Before & After</TabsTrigger>
        </TabsList>

        <TabsContent value="all-photos" className="space-y-4 pt-4">
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
              <Button>
                <Camera className="mr-2 h-4 w-4" />
                Add Photo
              </Button>
            </div>
          </div>

          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden group">
                  <div className="relative aspect-square">
                    <Image
                      src={photo.thumbnail_url || "/placeholder.svg"}
                      alt={photo.title || "Project photo"}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="secondary"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setSelectedPhoto(photo)}
                      >
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
                      <p className="text-xs text-muted-foreground">{formatDate(photo.created_at)}</p>
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
                        src={photo.thumbnail_url || "/placeholder.svg"}
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
                              {formatDate(photo.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
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
        </TabsContent>

        <TabsContent value="before-after" className="space-y-4 pt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Before & After Comparison</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before Photos */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Before</h4>
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                  <Image
                    src={beforePhotos[0]?.photo_url || "/placeholder.svg?height=800&width=1200&query=placeholder"}
                    alt={beforePhotos[0]?.title || "Before photo"}
                    fill
                    className="object-contain"
                  />
                  {beforePhotos.length > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive">Before</Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* After Photos */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">After</h4>
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                  <Image
                    src={afterPhotos[0]?.photo_url || "/placeholder.svg?height=800&width=1200&query=placeholder"}
                    alt={afterPhotos[0]?.title || "After photo"}
                    fill
                    className="object-contain"
                  />
                  {afterPhotos.length > 0 && (
                    <div className="absolute top-2 left-2">
                      <Badge>After</Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {/* Engine Bay Comparison */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Engine Bay</h4>
                  <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                    <Image src="/vintage-engine-bay-rusty.png" alt="Engine Bay Before" fill className="object-cover" />
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive">Before</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Engine Bay</h4>
                  <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                    <Image src="/restored-vintage-engine-bay.png" alt="Engine Bay After" fill className="object-cover" />
                    <div className="absolute top-2 left-2">
                      <Badge>After</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Paint Comparison */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Exterior Paint</h4>
                  <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                    <Image src="/vintage-car-faded-paint.png" alt="Paint Before" fill className="object-cover" />
                    <div className="absolute top-2 left-2">
                      <Badge variant="destructive">Before</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">Exterior Paint</h4>
                  <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                    <Image src="/vintage-red-car.png" alt="Paint After" fill className="object-cover" />
                    <div className="absolute top-2 left-2">
                      <Badge>After</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Photo Detail Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
        <DialogContent className="max-w-4xl w-[90vw]">
          <DialogHeader>
            <DialogTitle>{selectedPhoto?.title || "Photo Detail"}</DialogTitle>
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
          <div className="space-y-2">
            {selectedPhoto?.description && <p className="text-sm">{selectedPhoto.description}</p>}
            {selectedPhoto?.tags && selectedPhoto.tags.length > 0 && (
              <div className="flex items-center gap-1">
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
          </div>
          <div className="flex justify-between">
            <Button variant="outline">Edit Photo</Button>
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

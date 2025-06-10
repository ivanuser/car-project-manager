"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Camera, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Photo {
  id: string
  title: string | null
  photo_url: string
  thumbnail_url: string
}

interface BeforeAfterComparisonProps {
  beforePhotos: Photo[]
  afterPhotos: Photo[]
  projectId: string
}

export function BeforeAfterComparison({ beforePhotos, afterPhotos, projectId }: BeforeAfterComparisonProps) {
  const [beforeIndex, setBeforeIndex] = useState(0)
  const [afterIndex, setAfterIndex] = useState(0)
  const [comparisonMode, setComparisonMode] = useState<"side-by-side" | "slider">("side-by-side")

  const hasBeforePhotos = beforePhotos.length > 0
  const hasAfterPhotos = afterPhotos.length > 0
  const hasComparison = hasBeforePhotos && hasAfterPhotos

  const nextBeforePhoto = () => {
    setBeforeIndex((prev) => (prev + 1) % beforePhotos.length)
  }

  const prevBeforePhoto = () => {
    setBeforeIndex((prev) => (prev - 1 + beforePhotos.length) % beforePhotos.length)
  }

  const nextAfterPhoto = () => {
    setAfterIndex((prev) => (prev + 1) % afterPhotos.length)
  }

  const prevAfterPhoto = () => {
    setAfterIndex((prev) => (prev - 1 + afterPhotos.length) % afterPhotos.length)
  }

  if (!hasBeforePhotos && !hasAfterPhotos) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <Camera className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No before/after photos available</p>
          <p className="text-sm text-muted-foreground mb-4">
            Add photos and mark them as "Before" or "After" to create comparisons
          </p>
          <Button asChild>
            <Link href={`/dashboard/projects/${projectId}/gallery/upload`}>Add Photos</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Before & After</h3>
        {hasComparison && (
          <Tabs
            defaultValue="side-by-side"
            value={comparisonMode}
            onValueChange={(value) => setComparisonMode(value as "side-by-side" | "slider")}
          >
            <TabsList>
              <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
              <TabsTrigger value="slider">Slider</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {comparisonMode === "side-by-side" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Photos */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Before</h4>
            {hasBeforePhotos ? (
              <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                <Image
                  src={beforePhotos[beforeIndex].photo_url || "/placeholder.svg"}
                  alt={beforePhotos[beforeIndex].title || "Before photo"}
                  fill
                  className="object-contain"
                />
                {beforePhotos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                      onClick={prevBeforePhoto}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                      onClick={nextBeforePhoto}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-background/80 px-2 py-1 rounded-full">
                      {beforeIndex + 1} / {beforePhotos.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 bg-muted rounded-md">
                <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No before photos</p>
                <Button variant="link" size="sm" asChild className="mt-2">
                  <Link href={`/dashboard/projects/${projectId}/gallery/upload`}>Add Before Photo</Link>
                </Button>
              </div>
            )}
          </div>

          {/* After Photos */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">After</h4>
            {hasAfterPhotos ? (
              <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
                <Image
                  src={afterPhotos[afterIndex].photo_url || "/placeholder.svg"}
                  alt={afterPhotos[afterIndex].title || "After photo"}
                  fill
                  className="object-contain"
                />
                {afterPhotos.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                      onClick={prevAfterPhoto}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background/90"
                      onClick={nextAfterPhoto}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs bg-background/80 px-2 py-1 rounded-full">
                      {afterIndex + 1} / {afterPhotos.length}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 bg-muted rounded-md">
                <Camera className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No after photos</p>
                <Button variant="link" size="sm" asChild className="mt-2">
                  <Link href={`/dashboard/projects/${projectId}/gallery/upload`}>Add After Photo</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative aspect-video bg-muted rounded-md overflow-hidden">
          {hasComparison ? (
            <div className="relative w-full h-full">
              {/* This is a simplified slider implementation. In a real app, you'd use a more sophisticated slider component */}
              <div className="absolute inset-0 z-10">
                <Image
                  src={beforePhotos[beforeIndex].photo_url || "/placeholder.svg"}
                  alt={beforePhotos[beforeIndex].title || "Before photo"}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="absolute inset-0 z-20 clip-right" style={{ clipPath: "inset(0 50% 0 0)" }}>
                <Image
                  src={afterPhotos[afterIndex].photo_url || "/placeholder.svg"}
                  alt={afterPhotos[afterIndex].title || "After photo"}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                <div className="h-full w-0.5 bg-white shadow-md"></div>
                <div className="absolute top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-md">
                  <ChevronLeft className="h-4 w-4 inline-block" />
                  <ChevronRight className="h-4 w-4 inline-block" />
                </div>
              </div>
              <div className="absolute bottom-2 left-2 z-40 text-xs bg-background/80 px-2 py-1 rounded-full">
                Before: {beforeIndex + 1}/{beforePhotos.length}
              </div>
              <div className="absolute bottom-2 right-2 z-40 text-xs bg-background/80 px-2 py-1 rounded-full">
                After: {afterIndex + 1}/{afterPhotos.length}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <Camera className="h-10 w-10 text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Need both before and after photos for comparison</p>
              <Button asChild>
                <Link href={`/dashboard/projects/${projectId}/gallery/upload`}>Add Photos</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

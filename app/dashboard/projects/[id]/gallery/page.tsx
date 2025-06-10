import { notFound } from "next/navigation"
import Link from "next/link"
import { getVehicleProject } from "@/actions/project-actions"
import { getProjectPhotos, getBeforeAfterPhotos } from "@/actions/gallery-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Camera, Plus } from "lucide-react"
import { PhotoGrid } from "@/components/gallery/photo-grid"
import { BeforeAfterComparison } from "@/components/gallery/before-after-comparison"

interface GalleryPageProps {
  params: {
    id: string
  }
  searchParams: {
    view?: string
  }
}

export default async function GalleryPage({ params, searchParams }: GalleryPageProps) {
  const project = await getVehicleProject(params.id)

  if (!project) {
    notFound()
  }

  const photos = await getProjectPhotos(params.id)
  const { before: beforePhotos, after: afterPhotos } = await getBeforeAfterPhotos(params.id)

  // Determine active view
  const activeView = searchParams.view || "all"

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/projects/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Project Gallery</h2>
            <p className="text-muted-foreground">
              {project.make} {project.model} {project.year && `(${project.year})`}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/projects/${params.id}/gallery/upload`}>
            <Camera className="mr-2 h-4 w-4" />
            Add Photos
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={activeView}>
        <TabsList>
          <TabsTrigger value="all">All Photos</TabsTrigger>
          <TabsTrigger value="before-after">Before & After</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {photos.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Camera className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No photos added yet</p>
                <Button asChild>
                  <Link href={`/dashboard/projects/${params.id}/gallery/upload`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Photo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <PhotoGrid photos={photos} projectId={params.id} />
          )}
        </TabsContent>
        <TabsContent value="before-after" className="mt-4">
          <BeforeAfterComparison beforePhotos={beforePhotos} afterPhotos={afterPhotos} projectId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

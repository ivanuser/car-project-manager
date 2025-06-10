import { notFound } from "next/navigation"
import Link from "next/link"
import { getVehicleProject } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PhotoUploadForm } from "@/components/gallery/photo-upload-form"

interface UploadPhotoPageProps {
  params: {
    id: string
  }
}

export default async function UploadPhotoPage({ params }: UploadPhotoPageProps) {
  const project = await getVehicleProject(params.id)

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/projects/${params.id}/gallery`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Upload Photo</h2>
          <p className="text-muted-foreground">
            {project.make} {project.model} {project.year && `(${project.year})`}
          </p>
        </div>
      </div>

      <PhotoUploadForm projectId={params.id} />
    </div>
  )
}

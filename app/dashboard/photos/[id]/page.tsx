import { notFound } from "next/navigation"
import { getPhoto } from "@/actions/gallery-actions"
import { PhotoEditForm } from "@/components/gallery/photo-edit-form"

interface PhotoDetailPageProps {
  params: {
    id: string
  }
}

export default async function PhotoDetailPage({ params }: PhotoDetailPageProps) {
  const { data: photo, error } = await getPhoto(params.id)

  if (error || !photo) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Edit Photo</h2>
      <PhotoEditForm photo={photo} projectId={photo.project_id} />
    </div>
  )
}

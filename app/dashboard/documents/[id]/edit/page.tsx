import { notFound } from "next/navigation"
import { getDocumentById, getDocumentCategories } from "@/actions/document-actions"
import { getVehicleProjects } from "@/actions/project-actions"
import { DocumentUploadForm } from "@/components/documents/document-upload-form"

interface EditDocumentPageProps {
  params: {
    id: string
  }
}

export default async function EditDocumentPage({ params }: EditDocumentPageProps) {
  const document = await getDocumentById(params.id)
  const categories = await getDocumentCategories()
  const projects = await getVehicleProjects()

  if (!document) {
    notFound()
  }

  // Format document data for the form
  const formData = {
    id: document.id,
    title: document.title,
    description: document.description,
    categoryId: document.category_id || "",
    projectId: document.project_id || "",
    version: document.version || "",
    isPublic: document.is_public,
    file_name: document.file_name,
    tags: document.tags ? document.tags.map((tag: any) => tag.name).join(",") : "",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Document</h2>
        <p className="text-muted-foreground">Update document details</p>
      </div>

      <DocumentUploadForm categories={categories} projects={projects} defaultValues={formData} isEditing={true} />
    </div>
  )
}

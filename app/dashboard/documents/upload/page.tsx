import { getDocumentCategories } from "@/actions/document-actions"
import { getVehicleProjects } from "@/actions/project-actions"
import { DocumentUploadForm } from "@/components/documents/document-upload-form"

export default async function UploadDocumentPage() {
  const categories = await getDocumentCategories()
  const projects = await getVehicleProjects()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Upload Document</h2>
        <p className="text-muted-foreground">Add a new document to your repository</p>
      </div>

      <DocumentUploadForm categories={categories} projects={projects} />
    </div>
  )
}

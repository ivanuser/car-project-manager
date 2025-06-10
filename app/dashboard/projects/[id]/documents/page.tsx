import Link from "next/link"
import { notFound } from "next/navigation"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { getVehicleProject } from "@/actions/project-actions"
import { getDocuments } from "@/actions/document-actions"
import { DocumentList } from "@/components/documents/document-list"

interface ProjectDocumentsPageProps {
  params: {
    id: string
  }
}

export default async function ProjectDocumentsPage({ params }: ProjectDocumentsPageProps) {
  const project = await getVehicleProject(params.id)

  if (!project) {
    notFound()
  }

  const documents = await getDocuments({ projectId: params.id })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Project Documents</h2>
          <p className="text-muted-foreground">Documentation for {project.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/projects/${params.id}`}>Back to Project</Link>
          </Button>
          <Button asChild>
            <Link href={`/dashboard/documents/upload?projectId=${params.id}`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Document
            </Link>
          </Button>
        </div>
      </div>

      <DocumentList documents={documents} />
    </div>
  )
}

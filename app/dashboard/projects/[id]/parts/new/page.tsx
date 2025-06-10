import Link from "next/link"
import { getVehicleProject, getVehicleProjects } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { PartForm } from "@/components/parts/part-form"
import { notFound } from "next/navigation"

export default async function NewProjectPartPage({ params }: { params: { id: string } }) {
  // Get project and all projects
  const [project, projects] = await Promise.all([getVehicleProject(params.id), getVehicleProjects()])

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/projects/${params.id}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Add Part to {project.title}</h1>
        </div>
      </div>

      <Card className="p-6">
        <PartForm projects={projects} projectId={params.id} />
      </Card>
    </div>
  )
}

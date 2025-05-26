import { notFound } from "next/navigation"
import { getVehicleProject } from "@/actions/project-actions"
import { ProjectForm } from "@/components/projects/project-form"

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const project = await getVehicleProject(params.id)

  if (!project) {
    notFound()
  }

  // Transform project data to match ProjectForm expectations
  const defaultValues = {
    id: project.id,
    title: project.title,
    description: project.description || "",
    make: project.make,
    model: project.model,
    year: project.year?.toString() || "",
    vin: project.vin || "",
    projectType: project.project_type || "",
    startDate: project.start_date ? new Date(project.start_date) : undefined,
    endDate: project.end_date ? new Date(project.end_date) : undefined,
    budget: project.budget?.toString() || "",
    status: project.status || "planning",
    thumbnail_url: project.thumbnail_url || undefined,
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Edit Project</h1>
          <p className="text-muted-foreground mt-2">
            Update your project details and settings.
          </p>
        </div>
        <ProjectForm defaultValues={defaultValues} isEditing={true} />
      </div>
    </div>
  )
}

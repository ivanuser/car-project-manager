import Link from "next/link"
import { getVehicleProjects } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { TaskForm } from "@/components/tasks/task-form"

export default async function NewTaskPage({ searchParams }: { searchParams: { projectId?: string } }) {
  // Get all available projects for the dropdown
  const projects = await getVehicleProjects()
  
  // Get the project ID from query params if provided
  const preselectedProjectId = searchParams.projectId

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={preselectedProjectId ? `/dashboard/projects/${preselectedProjectId}` : "/dashboard/tasks"}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Create New Task</h1>
        </div>
      </div>

      <Card className="p-6">
        <TaskForm projects={projects} projectId={preselectedProjectId} />
      </Card>
    </div>
  )
}

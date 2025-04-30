import Link from "next/link"
import { getTaskById, getVehicleProjects } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import TaskForm from "@/components/tasks/task-form"
import { notFound } from "next/navigation"

export default async function EditTaskPage({ params }: { params: { id: string } }) {
  // Check if we're in preview mode
  const isMissingConfig = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (isMissingConfig) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/dashboard/tasks">
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold tracking-tight">Edit Task</h1>
          </div>
        </div>

        <Card className="p-6">
          <p className="text-center py-8">
            Supabase environment variables are not configured. This feature requires database connectivity.
          </p>
        </Card>
      </div>
    )
  }

  // Get task and projects
  const [task, projects] = await Promise.all([getTaskById(params.id), getVehicleProjects()])

  if (!task) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/tasks/${params.id}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Edit Task</h1>
        </div>
      </div>

      <Card className="p-6">
        <TaskForm projects={projects} task={task} />
      </Card>
    </div>
  )
}

import Link from "next/link"
import { getVehicleProjects } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { TaskForm } from "@/components/tasks/task-form"

export default async function NewTaskPage() {
  // Check if we're in preview mode
  const isMissingConfig = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Get projects only if we have Supabase configured
  const projects = isMissingConfig ? [] : await getVehicleProjects()

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
          <h1 className="text-2xl font-bold tracking-tight">Create New Task</h1>
        </div>
      </div>

      <Card className="p-6">
        <TaskForm projects={projects} />
      </Card>
    </div>
  )
}

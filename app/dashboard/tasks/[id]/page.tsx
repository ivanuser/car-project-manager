import Link from "next/link"
import { getTaskById } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Clock, CalendarDays, Edit, ArrowUpRight } from "lucide-react"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import TaskStatusActions from "@/components/tasks/task-status-actions"

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  // Check if we're in preview mode
  const isMissingConfig = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Get task only if we have Supabase configured
  const task = isMissingConfig ? null : await getTaskById(params.id)

  if (!task && !isMissingConfig) {
    notFound()
  }

  // Mock data for preview mode
  const mockTask = {
    id: "preview-task-id",
    title: "Example Task",
    description:
      "This is an example task description for preview mode. In a real application, this would show the actual task details from the database.",
    status: "in_progress",
    priority: "medium",
    due_date: new Date().toISOString(),
    estimated_hours: 4,
    build_stage: "assembly",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    vehicle_projects: {
      id: "preview-project-id",
      title: "Example Project",
    },
  }

  const displayTask = task || mockTask

  // Status badge colors
  const statusColors = {
    todo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  // Priority badge colors
  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  const statusColor = statusColors[displayTask.status as keyof typeof statusColors] || statusColors.todo
  const priorityColor = priorityColors[displayTask.priority as keyof typeof priorityColors] || priorityColors.medium

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
          <h1 className="text-2xl font-bold tracking-tight">{displayTask.title}</h1>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/tasks/${params.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Task
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Task Details</CardTitle>
              <CardDescription>
                Created {format(new Date(displayTask.created_at), "PPP")}
                {displayTask.updated_at &&
                  displayTask.updated_at !== displayTask.created_at &&
                  ` • Updated ${format(new Date(displayTask.updated_at), "PPP")}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p className="whitespace-pre-line">{displayTask.description || "No description provided."}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}
                  >
                    {displayTask.status === "todo"
                      ? "To Do"
                      : displayTask.status === "in_progress"
                        ? "In Progress"
                        : displayTask.status.charAt(0).toUpperCase() + displayTask.status.slice(1)}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityColor}`}
                  >
                    {displayTask.priority.charAt(0).toUpperCase() + displayTask.priority.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {displayTask.due_date && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      {format(new Date(displayTask.due_date), "PPP")}
                    </div>
                  </div>
                )}

                {displayTask.estimated_hours && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Estimated Time</h3>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {displayTask.estimated_hours} hours
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Build Stage</h3>
                <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
                  {displayTask.build_stage.charAt(0).toUpperCase() + displayTask.build_stage.slice(1)}
                </span>
              </div>
            </CardContent>
            {!isMissingConfig && (
              <CardFooter>
                <TaskStatusActions
                  taskId={params.id}
                  currentStatus={displayTask.status}
                  projectId={displayTask.vehicle_projects.id}
                />
              </CardFooter>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project</CardTitle>
            </CardHeader>
            <CardContent>
              {displayTask.vehicle_projects && (
                <div className="flex items-center justify-between">
                  <span>{displayTask.vehicle_projects.title}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/projects/${displayTask.vehicle_projects.id}`}>
                      <ArrowUpRight className="h-4 w-4" />
                      <span className="sr-only">View Project</span>
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Build Stages</CardTitle>
              <CardDescription>
                Current stage: {displayTask.build_stage.charAt(0).toUpperCase() + displayTask.build_stage.slice(1)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "planning",
                  "teardown",
                  "fabrication",
                  "assembly",
                  "paint",
                  "electrical",
                  "interior",
                  "testing",
                  "complete",
                ].map((stage, index) => {
                  const stageNames = {
                    planning: "Planning",
                    teardown: "Teardown",
                    fabrication: "Fabrication",
                    assembly: "Assembly",
                    paint: "Paint",
                    electrical: "Electrical",
                    interior: "Interior",
                    testing: "Testing",
                    complete: "Complete",
                  }

                  const stageName = stageNames[stage as keyof typeof stageNames]
                  const isCurrentStage = stage === displayTask.build_stage
                  const isPastStage =
                    [
                      "planning",
                      "teardown",
                      "fabrication",
                      "assembly",
                      "paint",
                      "electrical",
                      "interior",
                      "testing",
                      "complete",
                    ].indexOf(stage) <=
                    [
                      "planning",
                      "teardown",
                      "fabrication",
                      "assembly",
                      "paint",
                      "electrical",
                      "interior",
                      "testing",
                      "complete",
                    ].indexOf(displayTask.build_stage)

                  return (
                    <div key={stage} className="flex items-center">
                      <div
                        className={`h-6 w-6 rounded-full flex items-center justify-center mr-2 ${
                          isCurrentStage
                            ? "bg-primary text-primary-foreground"
                            : isPastStage
                              ? "bg-primary/30 text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <span className={isCurrentStage ? "font-medium" : ""}>{stageName}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { getTaskById } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Clock, CalendarDays, Edit, ArrowUpRight } from "lucide-react"
import { format } from "date-fns"
import { notFound } from "next/navigation"
import TaskStatusActions from "@/components/tasks/task-status-actions"

export default async function TaskDetailPage({ params }: { params: { id: string } }) {
  // Get task
  const task = await getTaskById(params.id)

  if (!task) {
    notFound()
  }

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

  const statusColor = statusColors[task.status as keyof typeof statusColors] || statusColors.todo
  const priorityColor = priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium

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
          <h1 className="text-2xl font-bold tracking-tight">{task.title}</h1>
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
                Created {format(new Date(task.created_at), "PPP")}
                {task.updated_at &&
                  task.updated_at !== task.created_at &&
                  ` • Updated ${format(new Date(task.updated_at), "PPP")}`}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
                <p className="whitespace-pre-line">{task.description || "No description provided."}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor}`}
                  >
                    {task.status === "todo"
                      ? "To Do"
                      : task.status === "in_progress"
                        ? "In Progress"
                        : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Priority</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${priorityColor}`}
                  >
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {task.due_date && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Due Date</h3>
                    <div className="flex items-center">
                      <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
                      {format(new Date(task.due_date), "PPP")}
                    </div>
                  </div>
                )}

                {task.estimated_hours && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Estimated Time</h3>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      {task.estimated_hours} hours
                    </div>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Build Stage</h3>
                <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
                  {task.build_stage.charAt(0).toUpperCase() + task.build_stage.slice(1)}
                </span>
              </div>
            </CardContent>
            <CardFooter>
              <TaskStatusActions
                taskId={params.id}
                currentStatus={task.status}
                projectId={task.vehicle_projects.id}
              />
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project</CardTitle>
            </CardHeader>
            <CardContent>
              {task.vehicle_projects && (
                <div className="flex items-center justify-between">
                  <span>{task.vehicle_projects.title}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/projects/${task.vehicle_projects.id}`}>
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
                Current stage: {task.build_stage.charAt(0).toUpperCase() + task.build_stage.slice(1)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "planning",
                  "disassembly",
                  "cleaning",
                  "repair", 
                  "fabrication",
                  "painting",
                  "assembly",
                  "electrical",
                  "testing",
                  "finishing",
                ].map((stage, index) => {
                  const stageNames = {
                    planning: "Planning",
                    disassembly: "Disassembly",
                    cleaning: "Cleaning",
                    repair: "Repair",
                    fabrication: "Fabrication",
                    painting: "Painting",
                    assembly: "Assembly",
                    electrical: "Electrical",
                    testing: "Testing",
                    finishing: "Finishing",
                  }

                  const stageName = stageNames[stage as keyof typeof stageNames]
                  const isCurrentStage = stage === task.build_stage
                  const isPastStage =
                    [
                      "planning",
                      "disassembly",
                      "cleaning",
                      "repair", 
                      "fabrication",
                      "painting",
                      "assembly",
                      "electrical",
                      "testing",
                      "finishing",
                    ].indexOf(stage) <=
                    [
                      "planning",
                      "disassembly",
                      "cleaning",
                      "repair", 
                      "fabrication",
                      "painting",
                      "assembly",
                      "electrical",
                      "testing",
                      "finishing",
                    ].indexOf(task.build_stage)

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

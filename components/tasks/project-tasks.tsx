import Link from "next/link"
import { getProjectTasks } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, CheckCircle, Clock, ListTodo, Plus, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface ProjectTasksProps {
  projectId: string
}

export default async function ProjectTasks({ projectId }: ProjectTasksProps) {
  // Check if we're in preview mode
  const isMissingConfig = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Get tasks only if we have Supabase configured
  const tasks = isMissingConfig ? [] : await getProjectTasks(projectId)

  // Group tasks by status
  const todoTasks = tasks.filter((task) => task.status === "todo")
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress")
  const completedTasks = tasks.filter((task) => task.status === "completed")
  const blockedTasks = tasks.filter((task) => task.status === "blocked")

  // Function to render task card
  const renderTaskCard = (task: any) => {
    const priorityColors = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }

    const priorityColor = priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium

    return (
      <Card key={task.id} className="mb-4 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColor}`}>{task.priority}</span>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>

          {task.due_date && (
            <div className="flex items-center mt-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3 w-3 mr-1" />
              Due {formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}
            </div>
          )}

          {task.estimated_hours && (
            <div className="flex items-center mt-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {task.estimated_hours} hours estimated
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2 flex justify-between">
          <div className="text-xs font-medium">
            <span className="inline-flex items-center rounded-full border px-2 py-1 text-xs">{task.build_stage}</span>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/dashboard/tasks/${task.id}`}>View</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>Manage tasks for this project</CardDescription>
        </div>
        <Button asChild size="sm">
          <Link href={`/dashboard/projects/${projectId}/tasks/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Task
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="todo" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="todo" className="flex items-center">
              <ListTodo className="h-4 w-4 mr-2" />
              To Do
              {todoTasks.length > 0 && (
                <span className="ml-2 text-xs bg-primary/10 px-2 py-0.5 rounded-full">{todoTasks.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="in_progress" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              In Progress
              {inProgressTasks.length > 0 && (
                <span className="ml-2 text-xs bg-primary/10 px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
              {completedTasks.length > 0 && (
                <span className="ml-2 text-xs bg-primary/10 px-2 py-0.5 rounded-full">{completedTasks.length}</span>
              )}
            </TabsTrigger>
            <TabsTrigger value="blocked" className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Blocked
              {blockedTasks.length > 0 && (
                <span className="ml-2 text-xs bg-primary/10 px-2 py-0.5 rounded-full">{blockedTasks.length}</span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todo" className="mt-6">
            {isMissingConfig || todoTasks.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {isMissingConfig ? "Tasks will display here when connected to Supabase" : "No tasks to do"}
                </p>
                {!isMissingConfig && (
                  <Button asChild variant="outline" className="mt-4">
                    <Link href={`/dashboard/projects/${projectId}/tasks/new`}>Create a Task</Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{todoTasks.map(renderTaskCard)}</div>
            )}
          </TabsContent>

          <TabsContent value="in_progress" className="mt-6">
            {isMissingConfig || inProgressTasks.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {isMissingConfig ? "Tasks will display here when connected to Supabase" : "No tasks in progress"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{inProgressTasks.map(renderTaskCard)}</div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {isMissingConfig || completedTasks.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {isMissingConfig ? "Tasks will display here when connected to Supabase" : "No completed tasks"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{completedTasks.map(renderTaskCard)}</div>
            )}
          </TabsContent>

          <TabsContent value="blocked" className="mt-6">
            {isMissingConfig || blockedTasks.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">
                  {isMissingConfig ? "Tasks will display here when connected to Supabase" : "No blocked tasks"}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">{blockedTasks.map(renderTaskCard)}</div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

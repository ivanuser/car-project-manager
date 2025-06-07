'use client'

import Link from "next/link"
import { getAllTasks } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, CheckCircle, Clock, ListTodo, Plus, AlertTriangle, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"

// Prevent static generation
export const dynamic = 'force-dynamic'

interface Task {
  id: string
  title: string
  description?: string
  status: 'todo' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high'
  build_stage?: string
  due_date?: string
  estimated_hours?: number
  vehicle_projects?: {
    id: string
    title: string
  }
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true)
        setError(null)
        const tasksData = await getAllTasks()
        setTasks(tasksData)
      } catch (err) {
        console.error('Error loading tasks:', err)
        setError('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [])

  // Group tasks by status
  const todoTasks = tasks.filter((task) => task.status === "todo")
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress")
  const completedTasks = tasks.filter((task) => task.status === "completed")
  const blockedTasks = tasks.filter((task) => task.status === "blocked")

  // Function to render task card
  const renderTaskCard = (task: Task) => {
    const priorityColors = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }

    const priorityColor = priorityColors[task.priority] || priorityColors.medium

    return (
      <Card key={task.id} className="mb-4 shadow-sm hover:shadow-md transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColor}`}>{task.priority}</span>
          </div>
          <CardDescription>
            {task.vehicle_projects?.title && (
              <Link href={`/dashboard/projects/${task.vehicle_projects.id}`} className="text-primary hover:underline">
                {task.vehicle_projects.title}
              </Link>
            )}
          </CardDescription>
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
            <p className="text-muted-foreground">Manage and track your project tasks.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading your tasks...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
            <p className="text-muted-foreground">Manage and track your project tasks.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/tasks/new">
              <Plus className="mr-2 h-4 w-4" />
              New Task
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-red-600">Error Loading Tasks</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {error}. Please try refreshing the page or check your connection.
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Refresh Page
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">Manage and track your project tasks.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/tasks/new">
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Link>
        </Button>
      </div>

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
          {todoTasks.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No tasks to do</p>
                <Button asChild variant="outline" className="mt-4">
                  <Link href="/dashboard/tasks/new">Create a Task</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{todoTasks.map(renderTaskCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="in_progress" className="mt-6">
          {inProgressTasks.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No tasks in progress</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{inProgressTasks.map(renderTaskCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {completedTasks.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No completed tasks</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{completedTasks.map(renderTaskCard)}</div>
          )}
        </TabsContent>

        <TabsContent value="blocked" className="mt-6">
          {blockedTasks.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No blocked tasks</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{blockedTasks.map(renderTaskCard)}</div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

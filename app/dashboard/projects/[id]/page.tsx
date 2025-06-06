import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { getVehicleProject, getProjectTasks, getProjectParts } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Calendar, DollarSign, Edit, Plus, Tag, Clock, CheckCircle, ListTodo, AlertTriangle, Package } from "lucide-react"
import { DeleteProjectDialog } from "@/components/projects/delete-project-dialog"

interface ProjectPageProps {
  params: {
    id: string
  }
  searchParams: {
    tab?: string
  }
}

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const [project, tasks, parts] = await Promise.all([
    getVehicleProject(params.id),
    getProjectTasks(params.id),
    getProjectParts(params.id)
  ])

  if (!project) {
    notFound()
  }

  // Format dates if they exist
  const startDate = project.start_date ? format(new Date(project.start_date), "PPP") : "Not set"
  const endDate = project.end_date ? format(new Date(project.end_date), "PPP") : "Not set"

  // Map project type to display name
  const projectTypeMap: Record<string, string> = {
    restoration: "Restoration",
    modification: "Modification",
    performance: "Performance Upgrade",
    maintenance: "Maintenance",
    repair: "Repair",
    custom: "Custom Build",
  }

  const projectType = project.project_type
    ? projectTypeMap[project.project_type] || project.project_type
    : "Not specified"

  // Determine active tab
  const activeTab = searchParams.tab || "overview"

  // Task statistics
  const todoTasks = tasks.filter(task => task.status === "todo")
  const inProgressTasks = tasks.filter(task => task.status === "in_progress")
  const completedTasks = tasks.filter(task => task.status === "completed")
  const blockedTasks = tasks.filter(task => task.status === "blocked")

  // Parts statistics
  const neededParts = parts.filter(part => part.status === "needed")
  const orderedParts = parts.filter(part => part.status === "ordered")
  const receivedParts = parts.filter(part => part.status === "received")
  const installedParts = parts.filter(part => part.status === "installed")

  // Parts rendering function
  const renderPartCard = (part: any) => {
    const statusColors = {
      needed: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      ordered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      received: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      installed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      returned: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }

    const statusColor = statusColors[part.status as keyof typeof statusColors] || statusColors.needed

    return (
      <Card key={part.id} className="mb-3">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">{part.name}</h4>
                <Badge variant="outline" className={`text-xs ${statusColor}`}>
                  {part.status.charAt(0).toUpperCase() + part.status.slice(1)}
                </Badge>
              </div>
              {part.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{part.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {part.part_number && (
                  <span className="inline-flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {part.part_number}
                  </span>
                )}
                {part.price && (
                  <span className="inline-flex items-center">
                    <DollarSign className="h-3 w-3 mr-1" />
                    ${part.price.toFixed(2)}
                    {part.quantity > 1 && ` × ${part.quantity}`}
                  </span>
                )}
                {part.purchase_date && (
                  <span className="inline-flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Purchased {format(new Date(part.purchase_date), "MMM d")}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/parts/${part.id}`}>View</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Task rendering function
  const renderTaskCard = (task: any) => {
    const priorityColors = {
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }

    const statusColors = {
      todo: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      in_progress: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      blocked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    }

    const priorityColor = priorityColors[task.priority as keyof typeof priorityColors] || priorityColors.medium
    const statusColor = statusColors[task.status as keyof typeof statusColors] || statusColors.todo

    return (
      <Card key={task.id} className="mb-3">
        <CardContent className="pt-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium">{task.title}</h4>
                <Badge variant="outline" className={`text-xs ${priorityColor}`}>
                  {task.priority}
                </Badge>
                <Badge variant="outline" className={`text-xs ${statusColor}`}>
                  {task.status === "todo" ? "To Do" : task.status === "in_progress" ? "In Progress" : task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </Badge>
              </div>
              {task.description && (
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{task.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {task.build_stage && (
                  <span className="inline-flex items-center">
                    <Tag className="h-3 w-3 mr-1" />
                    {task.build_stage.charAt(0).toUpperCase() + task.build_stage.slice(1)}
                  </span>
                )}
                {task.estimated_hours && (
                  <span className="inline-flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {task.estimated_hours}h
                  </span>
                )}
                {task.due_date && (
                  <span className="inline-flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    Due {format(new Date(task.due_date), "MMM d")}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/dashboard/tasks/${task.id}`}>View</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/projects">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{project.title}</h2>
            <p className="text-muted-foreground">
              {project.year && `${project.year} `}{project.make} {project.model}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href={`/dashboard/projects/${project.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Project
            </Link>
          </Button>
          <DeleteProjectDialog projectId={project.id} projectTitle={project.title} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Project thumbnail and description */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.thumbnail_url && (
              <div className="mb-4">
                <img
                  src={project.thumbnail_url}
                  alt={project.title}
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              {project.description ? (
                <p className="text-sm text-muted-foreground leading-relaxed">{project.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description provided</p>
              )}
            </div>

            {project.vin && (
              <div>
                <h3 className="text-lg font-medium mb-2">VIN</h3>
                <p className="font-mono text-sm bg-muted p-2 rounded">{project.vin}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Project metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Project Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[24px_1fr] gap-x-2 gap-y-3 items-start">
              <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Project Type</p>
                <p className="text-sm text-muted-foreground">{projectType}</p>
              </div>

              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Timeline</p>
                <p className="text-sm text-muted-foreground">
                  {startDate} to {endDate}
                </p>
              </div>

              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Budget</p>
                <p className="text-sm text-muted-foreground">
                  {project.budget ? `$${parseFloat(project.budget).toLocaleString()}` : "Not specified"}
                </p>
              </div>

              <div className="mt-0.5 h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <div className={`h-2 w-2 rounded-full ${
                  project.status === 'completed' ? 'bg-green-500' :
                  project.status === 'in_progress' ? 'bg-blue-500' :
                  project.status === 'on_hold' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`} />
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm text-muted-foreground capitalize">{project.status?.replace("_", " ") || 'Planning'}</p>
              </div>

              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm text-muted-foreground">{format(new Date(project.created_at), "PPP")}</p>
              </div>

              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm text-muted-foreground">{format(new Date(project.updated_at), "PPP")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks" className="relative">
            Tasks
            {tasks.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {tasks.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="parts" className="relative">
            Parts
            {parts.length > 0 && (
              <Badge variant="secondary" className="ml-2 text-xs">
                {parts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Vehicle:</span>
                    <span className="text-sm font-medium">
                      {project.year && `${project.year} `}{project.make} {project.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="text-sm font-medium">{projectType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status:</span>
                    <span className="text-sm font-medium capitalize">{project.status?.replace("_", " ") || 'Planning'}</span>
                  </div>
                  {project.budget && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Budget:</span>
                      <span className="text-sm font-medium">${parseFloat(project.budget).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Tasks:</span>
                    <span className="text-sm font-medium">{tasks.length} total</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Parts:</span>
                    <span className="text-sm font-medium">{parts.length} total</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Parts Statistics */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Parts Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                      <Package className="h-6 w-6 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold">{neededParts.length}</p>
                    <p className="text-sm text-muted-foreground">Needed</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold">{orderedParts.length}</p>
                    <p className="text-sm text-muted-foreground">Ordered</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold">{receivedParts.length}</p>
                    <p className="text-sm text-muted-foreground">Received</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold">{installedParts.length}</p>
                    <p className="text-sm text-muted-foreground">Installed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href={`/dashboard/projects/${project.id}/tasks/new`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full justify-start">
                    <Link href={`/dashboard/projects/${project.id}/parts/new`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Part
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Photo features coming soon</p>
              </CardContent>
            </Card>

            {/* Task Statistics */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Task Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mx-auto mb-2">
                      <ListTodo className="h-6 w-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold">{todoTasks.length}</p>
                    <p className="text-sm text-muted-foreground">To Do</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mx-auto mb-2">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold">{inProgressTasks.length}</p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mx-auto mb-2">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold">{completedTasks.length}</p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mx-auto mb-2">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <p className="text-2xl font-bold">{blockedTasks.length}</p>
                    <p className="text-sm text-muted-foreground">Blocked</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Tasks ({tasks.length})</h3>
            <Button size="sm" asChild>
              <Link href={`/dashboard/projects/${project.id}/tasks/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Link>
            </Button>
          </div>
          
          {tasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ListTodo className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No tasks created yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start organizing your project by creating tasks for different stages of your build.
                </p>
                <Button asChild>
                  <Link href={`/dashboard/projects/${project.id}/tasks/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Task
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Task Status Tabs */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">
                    All ({tasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="todo">
                    To Do ({todoTasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="in_progress">
                    In Progress ({inProgressTasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="completed">
                    Completed ({completedTasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="blocked">
                    Blocked ({blockedTasks.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <div className="space-y-2">
                    {tasks.map(renderTaskCard)}
                  </div>
                </TabsContent>

                <TabsContent value="todo" className="mt-4">
                  <div className="space-y-2">
                    {todoTasks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No tasks to do</p>
                    ) : (
                      todoTasks.map(renderTaskCard)
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="in_progress" className="mt-4">
                  <div className="space-y-2">
                    {inProgressTasks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No tasks in progress</p>
                    ) : (
                      inProgressTasks.map(renderTaskCard)
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="completed" className="mt-4">
                  <div className="space-y-2">
                    {completedTasks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No completed tasks</p>
                    ) : (
                      completedTasks.map(renderTaskCard)
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="blocked" className="mt-4">
                  <div className="space-y-2">
                    {blockedTasks.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No blocked tasks</p>
                    ) : (
                      blockedTasks.map(renderTaskCard)
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="parts" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Parts ({parts.length})</h3>
            <Button size="sm" asChild>
              <Link href={`/dashboard/projects/${project.id}/parts/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Part
              </Link>
            </Button>
          </div>
          
          {parts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No parts added yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start tracking your project parts by adding the components you need for your build.
                </p>
                <Button asChild>
                  <Link href={`/dashboard/projects/${project.id}/parts/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Part
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Part Status Tabs */}
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">
                    All ({parts.length})
                  </TabsTrigger>
                  <TabsTrigger value="needed">
                    Needed ({neededParts.length})
                  </TabsTrigger>
                  <TabsTrigger value="ordered">
                    Ordered ({orderedParts.length})
                  </TabsTrigger>
                  <TabsTrigger value="received">
                    Received ({receivedParts.length})
                  </TabsTrigger>
                  <TabsTrigger value="installed">
                    Installed ({installedParts.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <div className="space-y-2">
                    {parts.map(renderPartCard)}
                  </div>
                </TabsContent>

                <TabsContent value="needed" className="mt-4">
                  <div className="space-y-2">
                    {neededParts.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No parts needed</p>
                    ) : (
                      neededParts.map(renderPartCard)
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="ordered" className="mt-4">
                  <div className="space-y-2">
                    {orderedParts.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No parts ordered</p>
                    ) : (
                      orderedParts.map(renderPartCard)
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="received" className="mt-4">
                  <div className="space-y-2">
                    {receivedParts.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No parts received</p>
                    ) : (
                      receivedParts.map(renderPartCard)
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="installed" className="mt-4">
                  <div className="space-y-2">
                    {installedParts.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No parts installed</p>
                    ) : (
                      installedParts.map(renderPartCard)
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="gallery" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Gallery</h3>
            <Button size="sm" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Upload Photos
            </Button>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Photo gallery coming soon</p>
              <p className="text-sm text-muted-foreground">Document your build progress with photos and create before/after comparisons.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

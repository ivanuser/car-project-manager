import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { getVehicleProject } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, DollarSign, Edit, Plus, Tag } from "lucide-react"
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
  const project = await getVehicleProject(params.id)

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
                  {project.budget ? `${parseFloat(project.budget).toLocaleString()}` : "Not specified"}
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
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
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
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Part
                  </Button>
                  <Button variant="outline" className="w-full justify-start" disabled>
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Photo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">Additional features coming soon</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Tasks</h3>
            <Button size="sm" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Task management coming soon</p>
              <p className="text-sm text-muted-foreground">Track your project progress with tasks, milestones, and deadlines.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="parts" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Parts</h3>
            <Button size="sm" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Add Part
            </Button>
          </div>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Parts inventory coming soon</p>
              <p className="text-sm text-muted-foreground">Manage your parts inventory, track orders, and organize your build.</p>
            </CardContent>
          </Card>
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

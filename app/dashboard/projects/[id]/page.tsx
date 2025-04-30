import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { getVehicleProject } from "@/actions/project-actions"
import { getPartsByProjectId } from "@/actions/parts-actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, DollarSign, Edit, Plus, Tag } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { PartsList } from "@/components/parts/parts-list"

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
  const parts = await getPartsByProjectId(params.id)

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
  const activeTab = searchParams.tab || "tasks"

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
              {project.make} {project.model} {project.year && `(${project.year})`}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Project
          </Link>
        </Button>
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
                  src={project.thumbnail_url || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium mb-2">Description</h3>
              {project.description ? (
                <p>{project.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description provided</p>
              )}
            </div>

            {project.vin && (
              <div>
                <h3 className="text-lg font-medium mb-2">VIN</h3>
                <p className="font-mono">{project.vin}</p>
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
            <div className="grid grid-cols-[24px_1fr] gap-x-2 gap-y-3 items-center">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Project Type</p>
                <p className="text-sm">{projectType}</p>
              </div>

              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Timeline</p>
                <p className="text-sm">
                  {startDate} to {endDate}
                </p>
              </div>

              <DollarSign className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Budget</p>
                <p className="text-sm">{project.budget ? formatCurrency(project.budget) : "Not specified"}</p>
              </div>

              <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Status</p>
                <p className="text-sm capitalize">{project.status.replace("_", " ")}</p>
              </div>

              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Created</p>
                <p className="text-sm">{format(new Date(project.created_at), "PPP")}</p>
              </div>

              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm">{format(new Date(project.updated_at), "PPP")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>
        <TabsContent value="tasks" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Tasks</h3>
            <Button size="sm" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Task management coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="parts" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Parts</h3>
            <Button size="sm" asChild>
              <Link href={`/dashboard/projects/${project.id}/parts/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Part
              </Link>
            </Button>
          </div>
          <PartsList parts={parts} projectId={project.id} />
        </TabsContent>
        <TabsContent value="gallery" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Gallery</h3>
            <Button size="sm" disabled>
              <Plus className="mr-2 h-4 w-4" />
              Add Image
            </Button>
          </div>
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Gallery feature coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

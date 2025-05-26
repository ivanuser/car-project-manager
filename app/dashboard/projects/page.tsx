import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, DollarSign, Wrench } from "lucide-react"
import { getVehicleProjects } from "@/actions/project-actions"

export default async function ProjectsPage() {
  // Fetch actual projects from the database
  const projects = await getVehicleProjects()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage all your vehicle projects in one place.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-muted flex items-center justify-center">
              <Wrench className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Get started by creating your first vehicle project. Track your build progress, manage parts, and document your journey.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/projects/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-32 bg-gradient-to-r from-primary-dark/20 via-secondary/20 to-accent/20 relative">
                {project.thumbnail_url && (
                  <img 
                    src={project.thumbnail_url} 
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize bg-background/80 backdrop-blur-sm">
                    {project.status || 'planning'}
                  </span>
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                <CardDescription>
                  {project.year && `${project.year} `}{project.make} {project.model}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {project.description || "No description provided"}
                </p>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  {project.budget && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      ${parseFloat(project.budget).toLocaleString()}
                    </div>
                  )}
                  {project.start_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.start_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <div className="text-xs font-medium">
                  <span className="text-muted-foreground">
                    {project.project_type || 'General'}
                  </span>
                </div>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

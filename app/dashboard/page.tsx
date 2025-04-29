import Link from "next/link"
import { getVehicleProjects } from "@/actions/project-actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default async function Dashboard() {
  // Check if we're in preview mode
  const isMissingConfig = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Get projects only if we have Supabase configured
  const projects = isMissingConfig ? [] : await getVehicleProjects()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome to CAJPRO, your vehicle project management platform.</p>
        </div>
        <Button asChild className="md:hidden">
          <Link href="/dashboard/projects/new">
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {isMissingConfig && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Preview Mode</AlertTitle>
          <AlertDescription>
            Supabase environment variables are not configured. This is a preview of the dashboard UI without active
            database functionality.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Recent Projects</h3>
          <Button variant="outline" asChild size="sm">
            <Link href="/dashboard/projects">View All</Link>
          </Button>
        </div>

        {isMissingConfig || projects.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">
                {isMissingConfig
                  ? "Projects will display here when connected to Supabase"
                  : "You don't have any projects yet"}
              </p>
              <Button asChild>
                <Link href="/dashboard/projects/new">Create Your First Project</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary-dark/20 via-secondary/20 to-accent/20" />
                <CardHeader className="pb-2">
                  <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                  <CardDescription>
                    {project.make} {project.model} {project.year}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {project.description || "No description"}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-2">
                  <div className="text-xs font-medium">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize">
                      {project.status}
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Manage your project tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-muted-foreground">Task management coming soon</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              View Tasks
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Parts</CardTitle>
            <CardDescription>Track parts for your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-muted-foreground">Parts inventory coming soon</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              View Parts
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Store project documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-4">
              <p className="text-muted-foreground">Documentation feature coming soon</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              View Docs
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function ProjectsPage() {
  // Temporary: use empty projects array during database transition
  const projects: any[] = [] 

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

      <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
        <CardContent className="py-4">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">Database Migration in Progress</h3>
            <p className="text-amber-700 dark:text-amber-400 mb-4">
              We're currently migrating from Supabase to PostgreSQL. Project data will be available soon.
            </p>
          </div>
        </CardContent>
      </Card>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You don't have any projects yet</p>
            <Button asChild>
              <Link href="/dashboard/projects/new">Create Your First Project</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-primary-dark/20 via-secondary/20 to-accent/20" />
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{project.title}</CardTitle>
                <CardDescription>
                  {project.make} {project.model} {project.year}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="line-clamp-2 text-sm text-muted-foreground">{project.description || "No description"}</p>
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
  )
}

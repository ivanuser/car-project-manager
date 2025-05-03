import Link from "next/link"
import { createServerClient } from "@/lib/supabase"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default async function Dashboard() {
  // Check if we're in preview mode
  const isMissingConfig = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Initialize projects as an empty array
  let projects = []

  if (!isMissingConfig) {
    try {
      const supabase = createServerClient()

      // Get the current user
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Use the actual user ID from the session
        const userId = user.id
        console.log("Dashboard: Fetching projects for user ID:", userId)

        const { data, error } = await supabase
          .from("vehicle_projects")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Dashboard: Error fetching projects:", error)
        } else {
          projects = data || []
        }
      } else {
        console.log("Dashboard: No authenticated user found")
      }
    } catch (error) {
      console.error("Dashboard: Unexpected error:", error)
    }
  }

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
          <Card className="shadow-lg border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
            <CardContent className="py-12 text-center flex flex-col items-center">
              <div className="mb-6 w-32 h-32 flex items-center justify-center">
                <svg
                  width="100"
                  height="100"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-primary/70"
                >
                  <path
                    d="M22.5 8.5L20.5 2.5C20.3 2 19.8 1.5 19.2 1.5H4.8C4.2 1.5 3.7 1.9 3.5 2.5L1.5 8.5C1.2 9.2 1 9.9 1 10.7V19.5C1 20.1 1.4 20.5 2 20.5H3C3.6 20.5 4 20.1 4 19.5V18.5H20V19.5C20 20.1 20.4 20.5 21 20.5H22C22.6 20.5 23 20.1 23 19.5V10.7C23 9.9 22.8 9.2 22.5 8.5Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 11.5H20"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6.5 14.5C7.32843 14.5 8 13.8284 8 13C8 12.1716 7.32843 11.5 6.5 11.5C5.67157 11.5 5 12.1716 5 13C5 13.8284 5.67157 14.5 6.5 14.5Z"
                    fill="currentColor"
                  />
                  <path
                    d="M17.5 14.5C18.3284 14.5 19 13.8284 19 13C19 12.1716 18.3284 11.5 17.5 11.5C16.6716 11.5 16 12.1716 16 13C16 13.8284 16.6716 14.5 17.5 14.5Z"
                    fill="currentColor"
                  />
                  <path
                    d="M4.8 7.5L6.5 2.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M19.2 7.5L17.5 2.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 15.5H3.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20.5 15.5H22"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-muted-foreground mb-6 text-lg">
                {isMissingConfig
                  ? "Projects will display here when connected to Supabase"
                  : "You don't have any projects yet"}
              </p>
              <Button asChild size="lg">
                <Link href="/dashboard/projects/new">Create Your First Project</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 3).map((project) => (
              <Card
                key={project.id}
                className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-t-4 border-t-primary/70"
              >
                <div className="h-32 bg-gradient-to-r from-primary/30 via-secondary/30 to-accent/30" />
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
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize bg-primary/10 border-primary/20">
                      {project.status}
                    </span>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10">
                    <Link href={`/dashboard/projects/${project.id}`}>View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Manage your project tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Task Management</span>
                <Link href="/dashboard/tasks" className="text-xs text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Task Reports</span>
                <Link href="/dashboard/reports" className="text-xs text-primary hover:underline">
                  View Reports
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full hover:bg-primary/10">
              <Link href="/dashboard/tasks/new">Create New Task</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-secondary/50">
          <CardHeader>
            <CardTitle>Parts</CardTitle>
            <CardDescription>Track parts for your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground">Parts inventory coming soon</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full hover:bg-secondary/10" disabled>
              View Parts
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-accent/50">
          <CardHeader>
            <CardTitle>Documentation</CardTitle>
            <CardDescription>Store project documentation</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground">Documentation feature coming soon</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full hover:bg-accent/10" disabled>
              View Docs
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

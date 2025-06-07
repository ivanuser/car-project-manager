"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Car, Wrench, Plus } from "lucide-react"
import { getVehicleProjects } from "@/actions/project-actions"

export default function NewMaintenanceSchedulePage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      try {
        const userProjects = await getVehicleProjects()
        setProjects(userProjects)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/maintenance">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Add Maintenance Schedule</h2>
            <p className="text-muted-foreground">Loading your projects...</p>
          </div>
        </div>
      </div>
    )
  }

  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/maintenance">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Add Maintenance Schedule</h2>
            <p className="text-muted-foreground">Create a vehicle project first</p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Car className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Vehicle Projects Found</h3>
            <p className="text-center text-muted-foreground mb-6 max-w-md">
              You need to create a vehicle project before you can add maintenance schedules. 
              Projects help organize maintenance by vehicle.
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/projects/new">
                <Car className="mr-2 h-4 w-4" />
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/maintenance">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add Maintenance Schedule</h2>
          <p className="text-muted-foreground">Choose which vehicle to add maintenance for</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{project.title}</CardTitle>
                  <CardDescription>
                    {project.year} {project.make} {project.model}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground">
                  <p><strong>Status:</strong> {project.status}</p>
                  <p><strong>Stage:</strong> {project.build_stage}</p>
                </div>
                <Button asChild className="w-full group-hover:bg-primary/90">
                  <Link href={`/dashboard/projects/${project.id}/maintenance/new`}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Maintenance Schedule
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Plus className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-4">Need to add maintenance for a different vehicle?</p>
            <Button variant="outline" asChild>
              <Link href="/dashboard/projects/new">
                <Car className="mr-2 h-4 w-4" />
                Create New Project
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Wrench } from "lucide-react"

import { getVehicleProject } from "@/actions/project-actions"
import { MaintenanceScheduleForm } from "@/components/maintenance/maintenance-schedule-form"

interface NewMaintenanceSchedulePageProps {
  params: { id: string }
}

export default async function NewMaintenanceSchedulePage({ params }: NewMaintenanceSchedulePageProps) {
  const { id } = params

  // Fetch project data
  const project = await getVehicleProject(id)
  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/projects/${id}/maintenance`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add Maintenance Schedule</h2>
          <p className="text-muted-foreground">
            Create a new maintenance schedule for {project.title}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            New Maintenance Schedule
          </CardTitle>
          <CardDescription>
            Set up a recurring maintenance schedule for your {project.year} {project.make} {project.model}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaintenanceScheduleForm projectId={id} />
        </CardContent>
      </Card>
    </div>
  )
}

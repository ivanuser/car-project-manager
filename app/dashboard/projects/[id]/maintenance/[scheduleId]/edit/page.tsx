import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit3 } from "lucide-react"

import { getVehicleProject } from "@/actions/project-actions"
import { getMaintenanceSchedules } from "@/actions/maintenance-actions"
import { MaintenanceScheduleForm } from "@/components/maintenance/maintenance-schedule-form"

interface EditMaintenanceSchedulePageProps {
  params: { id: string; scheduleId: string }
}

export default async function EditMaintenanceSchedulePage({ params }: EditMaintenanceSchedulePageProps) {
  const { id, scheduleId } = params

  // Fetch project data
  const project = await getVehicleProject(id)
  if (!project) {
    notFound()
  }

  // Fetch maintenance schedules to find the specific one
  const schedules = await getMaintenanceSchedules(id)
  const schedule = schedules.find(s => s.id === scheduleId)
  
  if (!schedule) {
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
          <h2 className="text-2xl font-bold tracking-tight">Edit Maintenance Schedule</h2>
          <p className="text-muted-foreground">
            Update the maintenance schedule for {project.title}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Edit: {schedule.title}
          </CardTitle>
          <CardDescription>
            Update the maintenance schedule for your {project.year} {project.make} {project.model}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaintenanceScheduleForm projectId={id} schedule={schedule} />
        </CardContent>
      </Card>
    </div>
  )
}

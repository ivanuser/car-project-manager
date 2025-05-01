import { getVehicleProject } from "@/actions/project-actions"
import { getMaintenanceSchedules } from "@/actions/maintenance-actions"
import { MaintenanceScheduleForm } from "@/components/maintenance/maintenance-schedule-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface EditMaintenanceSchedulePageProps {
  params: {
    id: string
    scheduleId: string
  }
}

export default async function EditMaintenanceSchedulePage({ params }: EditMaintenanceSchedulePageProps) {
  const projectId = params.id
  const scheduleId = params.scheduleId

  const project = await getVehicleProject(projectId)
  if (!project) {
    notFound()
  }

  const schedules = await getMaintenanceSchedules(projectId)
  const schedule = schedules.find((s) => s.id === scheduleId)
  if (!schedule) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/projects/${projectId}/maintenance`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Edit Maintenance Schedule</h2>
          <p className="text-muted-foreground">
            Update maintenance schedule for {project.make} {project.model}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Details</CardTitle>
          <CardDescription>Update your maintenance schedule settings</CardDescription>
        </CardHeader>
        <CardContent>
          <MaintenanceScheduleForm projectId={projectId} schedule={schedule} />
        </CardContent>
      </Card>
    </div>
  )
}

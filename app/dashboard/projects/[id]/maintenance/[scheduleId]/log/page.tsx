import { getVehicleProject } from "@/actions/project-actions"
import { getMaintenanceSchedules } from "@/actions/maintenance-actions"
import { MaintenanceLogForm } from "@/components/maintenance/maintenance-log-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface LogMaintenancePageProps {
  params: {
    id: string
    scheduleId: string
  }
}

export default async function LogMaintenancePage({ params }: LogMaintenancePageProps) {
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
          <h2 className="text-2xl font-bold tracking-tight">Log Maintenance</h2>
          <p className="text-muted-foreground">
            Record completed maintenance for {project.make} {project.model}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Log</CardTitle>
          <CardDescription>Record details about the completed maintenance</CardDescription>
        </CardHeader>
        <CardContent>
          <MaintenanceLogForm projectId={projectId} schedule={schedule} />
        </CardContent>
      </Card>
    </div>
  )
}

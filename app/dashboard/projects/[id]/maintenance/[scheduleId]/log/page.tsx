import Link from "next/link"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, CheckCircle2 } from "lucide-react"

import { getVehicleProject } from "@/actions/project-actions"
import { getMaintenanceSchedules } from "@/actions/maintenance-actions"
import { MaintenanceLogForm } from "@/components/maintenance/maintenance-log-form"

interface LogMaintenancePageProps {
  params: { id: string; scheduleId: string }
}

export default async function LogMaintenancePage({ params }: LogMaintenancePageProps) {
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
          <h2 className="text-2xl font-bold tracking-tight">Log Maintenance Completion</h2>
          <p className="text-muted-foreground">
            Record completion of maintenance for {project.title}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            Complete: {schedule.title}
          </CardTitle>
          <CardDescription>
            Log the completion of this maintenance task and update the schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaintenanceLogForm projectId={id} schedule={schedule} />
        </CardContent>
      </Card>
    </div>
  )
}

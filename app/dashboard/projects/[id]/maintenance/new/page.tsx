import { getVehicleProject } from "@/actions/project-actions"
import { MaintenanceScheduleForm } from "@/components/maintenance/maintenance-schedule-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface NewMaintenanceSchedulePageProps {
  params: {
    id: string
  }
}

export default async function NewMaintenanceSchedulePage({ params }: NewMaintenanceSchedulePageProps) {
  const projectId = params.id
  const project = await getVehicleProject(projectId)

  if (!project) {
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
          <h2 className="text-2xl font-bold tracking-tight">New Maintenance Schedule</h2>
          <p className="text-muted-foreground">
            Create a new maintenance schedule for {project.make} {project.model}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance Details</CardTitle>
          <CardDescription>Set up a recurring maintenance schedule for your vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <MaintenanceScheduleForm projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  )
}

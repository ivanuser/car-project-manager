import Link from "next/link"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Wrench, Calendar, AlertTriangle } from "lucide-react"

import { getVehicleProject } from "@/actions/project-actions"
import { getMaintenanceSchedules, getMaintenanceLogs, checkMaintenanceNotifications } from "@/actions/maintenance-actions"
import { MaintenanceScheduleList } from "@/components/maintenance/maintenance-schedule-list"
import { MaintenanceLogsTable } from "@/components/maintenance/maintenance-logs-table"

interface ProjectMaintenancePageProps {
  params: { id: string }
}

export default async function ProjectMaintenancePage({ params }: ProjectMaintenancePageProps) {
  const { id } = params

  // Fetch project data
  const project = await getVehicleProject(id)
  if (!project) {
    notFound()
  }

  // Check for due maintenance and create notifications
  await checkMaintenanceNotifications()

  // Fetch maintenance data
  const schedules = await getMaintenanceSchedules(id)
  const logs = await getMaintenanceLogs(id)

  // Group schedules by status
  const overdueSchedules = schedules.filter((schedule) => schedule.status === "overdue")
  const dueSchedules = schedules.filter((schedule) => schedule.status === "due")
  const upcomingSchedules = schedules.filter((schedule) => schedule.status === "upcoming")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/projects/${id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to project</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {project.title} - Maintenance
            </h2>
            <p className="text-muted-foreground">
              {project.year} {project.make} {project.model}
            </p>
          </div>
        </div>
        <Button asChild>
          <Link href={`/dashboard/projects/${id}/maintenance/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Maintenance Schedule
          </Link>
        </Button>
      </div>

      {/* Maintenance Status Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueSchedules.length}</div>
            <p className="text-xs text-muted-foreground">Maintenance tasks past due</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wrench className="h-4 w-4 text-yellow-500" />
              Due Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{dueSchedules.length}</div>
            <p className="text-xs text-muted-foreground">Maintenance tasks due now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{upcomingSchedules.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled for the future</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="schedules">
        <TabsList>
          <TabsTrigger value="schedules">Maintenance Schedules</TabsTrigger>
          <TabsTrigger value="logs">Maintenance History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="schedules" className="mt-4">
          <MaintenanceScheduleList schedules={schedules} projectId={id} />
        </TabsContent>
        
        <TabsContent value="logs" className="mt-4">
          <MaintenanceLogsTable logs={logs} projectId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

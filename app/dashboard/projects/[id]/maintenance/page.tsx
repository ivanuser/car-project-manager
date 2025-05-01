import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { getVehicleProject } from "@/actions/project-actions"
import { getMaintenanceSchedules, getMaintenanceLogs } from "@/actions/maintenance-actions"
import { MaintenanceScheduleList } from "@/components/maintenance/maintenance-schedule-list"
import { MaintenanceLogsTable } from "@/components/maintenance/maintenance-logs-table"
import { notFound } from "next/navigation"

interface MaintenancePageProps {
  params: {
    id: string
  }
  searchParams: {
    tab?: string
  }
}

export default async function MaintenancePage({ params, searchParams }: MaintenancePageProps) {
  const projectId = params.id
  const activeTab = searchParams.tab || "schedules"

  const project = await getVehicleProject(projectId)
  if (!project) {
    notFound()
  }

  const schedules = await getMaintenanceSchedules(projectId)
  const logs = await getMaintenanceLogs(projectId)

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maintenance</h2>
          <p className="text-muted-foreground">
            Manage maintenance schedules and service history for {project.make} {project.model}
          </p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/projects/${projectId}/maintenance/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Add Maintenance Schedule
          </Link>
        </Button>
      </div>

      <Tabs defaultValue={activeTab}>
        <TabsList>
          <TabsTrigger value="schedules">Maintenance Schedules</TabsTrigger>
          <TabsTrigger value="history">Service History</TabsTrigger>
        </TabsList>
        <TabsContent value="schedules" className="mt-4">
          <MaintenanceScheduleList schedules={schedules} projectId={projectId} />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <MaintenanceLogsTable logs={logs} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

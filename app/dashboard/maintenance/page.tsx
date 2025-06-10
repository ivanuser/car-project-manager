'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllMaintenanceSchedules, checkMaintenanceNotifications } from "@/actions/maintenance-actions"
import { getVehicleProjects } from "@/actions/project-actions"
import { MaintenanceScheduleList } from "@/components/maintenance/maintenance-schedule-list"
import { RefreshCcw, Plus, Car } from "lucide-react"

// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

interface MaintenanceSchedule {
  id: string
  title: string
  description: string | null
  type: string
  interval_type: string
  interval_value: number
  last_completed_at: string | null
  next_due_at: string | null
  status: string
  project_id: string
  created_at: string
  updated_at: string
}

export default function MaintenanceDashboardPage() {
  const [schedules, setSchedules] = useState<MaintenanceSchedule[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Check for due maintenance and create notifications
        await checkMaintenanceNotifications()

        // Get all maintenance schedules for the user
        const schedulesData = await getAllMaintenanceSchedules()
        setSchedules(schedulesData)

        // Get user's projects to check if they have any
        const projectsData = await getVehicleProjects()
        setProjects(projectsData)
      } catch (error) {
        console.error("Error loading maintenance data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Group schedules by status
  const overdueSchedules = schedules.filter((schedule) => schedule.status === "overdue")
  const dueSchedules = schedules.filter((schedule) => schedule.status === "due")
  const upcomingSchedules = schedules.filter((schedule) => schedule.status === "upcoming")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maintenance Dashboard</h2>
          <p className="text-muted-foreground">Track and manage maintenance schedules for all your vehicles</p>
        </div>
        <div className="flex gap-2">
          {projects.length > 0 ? (
            <>
              <Button asChild>
                <Link href="/dashboard/maintenance/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Maintenance Schedule
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/dashboard/maintenance?refresh=true">
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Check for Due Maintenance
                </Link>
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link href="/dashboard/projects/new">
                <Car className="mr-2 h-4 w-4" />
                Create Your First Project
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueSchedules.length}</div>
            <p className="text-xs text-muted-foreground">Maintenance tasks past due date</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{dueSchedules.length}</div>
            <p className="text-xs text-muted-foreground">Maintenance tasks due now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{upcomingSchedules.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled for the future</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Maintenance</TabsTrigger>
          <TabsTrigger value="overdue">Overdue</TabsTrigger>
          <TabsTrigger value="due">Due Soon</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          {schedules.length > 0 ? (
            <MaintenanceScheduleList
              schedules={schedules.map((s) => ({
                ...s,
                project_id: s.project_id,
              }))}
              projectId=""
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                {projects.length > 0 ? (
                  <>
                    <Plus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="mb-2 text-center font-medium">No maintenance schedules found</p>
                    <p className="mb-6 text-center text-sm text-muted-foreground max-w-md">
                      Create maintenance schedules for your vehicles to track oil changes, tire rotations, and other service intervals
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/maintenance/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Your First Maintenance Schedule
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <p className="mb-2 text-center font-medium">No vehicle projects found</p>
                    <p className="mb-6 text-center text-sm text-muted-foreground max-w-md">
                      Create a vehicle project first, then add maintenance schedules to track service intervals
                    </p>
                    <Button asChild>
                      <Link href="/dashboard/projects/new">
                        <Car className="mr-2 h-4 w-4" />
                        Create Your First Project
                      </Link>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="overdue" className="mt-4">
          {overdueSchedules.length > 0 ? (
            <MaintenanceScheduleList
              schedules={overdueSchedules.map((s) => ({
                ...s,
                project_id: s.project_id,
              }))}
              projectId=""
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="mb-4 text-center text-muted-foreground">No overdue maintenance</p>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  All your maintenance tasks are up to date
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="due" className="mt-4">
          {dueSchedules.length > 0 ? (
            <MaintenanceScheduleList
              schedules={dueSchedules.map((s) => ({
                ...s,
                project_id: s.project_id,
              }))}
              projectId=""
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="mb-4 text-center text-muted-foreground">No maintenance due soon</p>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  Check back later for upcoming maintenance tasks
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          {upcomingSchedules.length > 0 ? (
            <MaintenanceScheduleList
              schedules={upcomingSchedules.map((s) => ({
                ...s,
                project_id: s.project_id,
              }))}
              projectId=""
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="mb-4 text-center text-muted-foreground">No upcoming maintenance</p>
                <p className="mb-4 text-center text-sm text-muted-foreground">
                  Add maintenance schedules to see upcoming tasks
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

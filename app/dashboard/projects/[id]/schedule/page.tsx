import { notFound } from "next/navigation"
import Link from "next/link"
import { getVehicleProject } from "@/actions/project-actions"
import { getProjectWorkSessions } from "@/actions/timeline-actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { CalendarView } from "@/components/timeline/calendar-view"

interface SchedulePageProps {
  params: {
    id: string
  }
}

export default async function SchedulePage({ params }: SchedulePageProps) {
  const project = await getVehicleProject(params.id)
  const workSessions = await getProjectWorkSessions(params.id)

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/projects/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Project Schedule</h2>
            <p className="text-muted-foreground">{project.title}</p>
          </div>
        </div>
      </div>

      <CalendarView workSessions={workSessions} projectId={params.id} />
    </div>
  )
}

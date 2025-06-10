import { notFound } from "next/navigation"
import Link from "next/link"
import { getVehicleProject } from "@/actions/project-actions"
import { getProjectMilestones, getProjectTimelineItems, generateTimelineFromTasks } from "@/actions/timeline-actions"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCcw } from "lucide-react"
import { GanttChart } from "@/components/timeline/gantt-chart"
import { MilestoneList } from "@/components/timeline/milestone-list"

interface TimelinePageProps {
  params: {
    id: string
  }
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const project = await getVehicleProject(params.id)
  const milestones = await getProjectMilestones(params.id)
  const timelineItems = await getProjectTimelineItems(params.id)

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
            <h2 className="text-2xl font-bold tracking-tight">Project Timeline</h2>
            <p className="text-muted-foreground">{project.title}</p>
          </div>
        </div>
        <form action={async () => await generateTimelineFromTasks(params.id)}>
          <Button type="submit" variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Generate from Tasks
          </Button>
        </form>
      </div>

      <div className="space-y-6">
        <GanttChart timelineItems={timelineItems} projectId={params.id} />
        <MilestoneList milestones={milestones} projectId={params.id} />
      </div>
    </div>
  )
}

import { getAllWorkSessions } from "@/actions/timeline-actions"
import { CalendarView } from "@/components/timeline/calendar-view"

export default async function CalendarPage() {
  const workSessions = await getAllWorkSessions()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Work Calendar</h2>
        <p className="text-muted-foreground">Schedule and manage your work sessions across all projects</p>
      </div>

      <CalendarView workSessions={workSessions} />
    </div>
  )
}

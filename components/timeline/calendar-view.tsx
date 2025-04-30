"use client"

import { useState, useCallback } from "react"
import { Calendar, momentLocalizer, Views } from "react-big-calendar"
import moment from "moment"
import "react-big-calendar/lib/css/react-big-calendar.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { Plus } from "lucide-react"
import Link from "next/link"

const localizer = momentLocalizer(moment)

interface CalendarViewProps {
  workSessions: any[]
  projectId?: string
}

export function CalendarView({ workSessions, projectId }: CalendarViewProps) {
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)

  // Convert work sessions to calendar events
  const events = workSessions.map((session) => ({
    id: session.id,
    title: session.title,
    start: new Date(session.start_time),
    end: new Date(session.end_time),
    resource: session,
  }))

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event.resource)
  }, [])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>{projectId ? "Project Schedule" : "Work Calendar"}</CardTitle>
        <Button size="sm" asChild>
          <Link href={projectId ? `/dashboard/projects/${projectId}/schedule/new` : "/dashboard/calendar/new"}>
            <Plus className="mr-2 h-4 w-4" />
            Add Work Session
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[600px]">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            defaultView={Views.MONTH}
            defaultDate={new Date()}
          />
        </div>

        <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedEvent?.description && <p>{selectedEvent.description}</p>}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Start Time</p>
                  <p>{selectedEvent && format(new Date(selectedEvent.start_time), "PPP p")}</p>
                </div>
                <div>
                  <p className="font-medium">End Time</p>
                  <p>{selectedEvent && format(new Date(selectedEvent.end_time), "PPP p")}</p>
                </div>
                {selectedEvent?.location && (
                  <div>
                    <p className="font-medium">Location</p>
                    <p>{selectedEvent.location}</p>
                  </div>
                )}
                {selectedEvent?.project_tasks && (
                  <div>
                    <p className="font-medium">Related Task</p>
                    <p>{selectedEvent.project_tasks.title}</p>
                  </div>
                )}
                {selectedEvent?.notes && (
                  <div className="col-span-2">
                    <p className="font-medium">Notes</p>
                    <p>{selectedEvent.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                  Close
                </Button>
                <Button asChild>
                  <Link
                    href={
                      projectId
                        ? `/dashboard/projects/${projectId}/schedule/${selectedEvent?.id}`
                        : `/dashboard/calendar/${selectedEvent?.id}`
                    }
                  >
                    Edit
                  </Link>
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

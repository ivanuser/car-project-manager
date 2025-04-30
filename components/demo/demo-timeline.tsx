"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Flag } from "lucide-react"

export function DemoTimeline() {
  const [activeTab, setActiveTab] = useState("gantt")

  // Sample data for Gantt chart
  const timelineItems = [
    {
      id: "1",
      title: "Engine Removal",
      start_date: "2023-05-01",
      end_date: "2023-05-10",
      progress: 100,
      is_critical_path: true,
    },
    {
      id: "2",
      title: "Engine Rebuild",
      start_date: "2023-05-11",
      end_date: "2023-06-15",
      progress: 75,
      is_critical_path: true,
    },
    {
      id: "3",
      title: "Transmission Overhaul",
      start_date: "2023-05-15",
      end_date: "2023-06-10",
      progress: 60,
      is_critical_path: false,
    },
    {
      id: "4",
      title: "Interior Restoration",
      start_date: "2023-06-01",
      end_date: "2023-07-15",
      progress: 30,
      is_critical_path: false,
    },
    {
      id: "5",
      title: "Paint and Body Work",
      start_date: "2023-06-20",
      end_date: "2023-08-10",
      progress: 10,
      is_critical_path: true,
    },
    {
      id: "6",
      title: "Final Assembly",
      start_date: "2023-08-11",
      end_date: "2023-09-15",
      progress: 0,
      is_critical_path: true,
    },
  ]

  // Sample milestones
  const milestones = [
    {
      id: "1",
      title: "Engine Rebuild Complete",
      description: "Complete rebuild of the 302 V8 engine",
      due_date: "2023-06-15",
      completed_at: "2023-06-12",
      is_critical: true,
    },
    {
      id: "2",
      title: "Transmission Installation",
      description: "Install rebuilt transmission",
      due_date: "2023-06-20",
      completed_at: null,
      is_critical: true,
    },
    {
      id: "3",
      title: "Interior Completion",
      description: "Complete interior restoration including upholstery",
      due_date: "2023-07-15",
      completed_at: null,
      is_critical: false,
    },
    {
      id: "4",
      title: "Paint Job Finished",
      description: "Complete exterior paint in original factory color",
      due_date: "2023-08-10",
      completed_at: null,
      is_critical: true,
    },
  ]

  // Sample work sessions for calendar
  const workSessions = [
    {
      id: "1",
      title: "Engine Teardown",
      start: new Date(2023, 4, 1, 9, 0),
      end: new Date(2023, 4, 1, 17, 0),
    },
    {
      id: "2",
      title: "Cylinder Head Rebuild",
      start: new Date(2023, 4, 5, 9, 0),
      end: new Date(2023, 4, 6, 17, 0),
    },
    {
      id: "3",
      title: "Transmission Work",
      start: new Date(2023, 4, 15, 9, 0),
      end: new Date(2023, 4, 15, 17, 0),
    },
    {
      id: "4",
      title: "Interior Disassembly",
      start: new Date(2023, 5, 1, 9, 0),
      end: new Date(2023, 5, 1, 17, 0),
    },
    {
      id: "5",
      title: "Paint Preparation",
      start: new Date(2023, 5, 20, 9, 0),
      end: new Date(2023, 5, 22, 17, 0),
    },
  ]

  // Render Gantt chart (simplified version for demo)
  const renderGanttChart = () => {
    return (
      <div className="space-y-4">
        {timelineItems.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">{item.title}</span>
                {item.is_critical_path && <Badge variant="destructive">Critical Path</Badge>}
              </div>
              <span className="text-sm text-muted-foreground">
                {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={item.progress} className="h-2 flex-1" />
              <span className="text-sm font-medium">{item.progress}%</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Render milestones list
  const renderMilestones = () => {
    return (
      <div className="space-y-4">
        {milestones.map((milestone) => (
          <div key={milestone.id} className="flex items-start space-x-4 rounded-lg border p-4">
            <div className="mt-0.5">
              {milestone.completed_at ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : milestone.is_critical ? (
                <Flag className="h-5 w-5 text-red-500" />
              ) : (
                <Circle className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <h3 className="font-medium">{milestone.title}</h3>
                {milestone.is_critical && <Badge variant="destructive">Critical</Badge>}
              </div>
              {milestone.description && <p className="text-sm text-muted-foreground">{milestone.description}</p>}
              <div className="mt-1 flex items-center space-x-2 text-sm">
                <span className="text-muted-foreground">Due: {new Date(milestone.due_date).toLocaleDateString()}</span>
                {milestone.completed_at && (
                  <span className="text-green-600">
                    Completed: {new Date(milestone.completed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
            <Button variant="ghost" size="sm">
              View
            </Button>
          </div>
        ))}
      </div>
    )
  }

  // Render calendar view - simplified custom implementation
  const renderCalendar = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const currentDate = new Date(2023, 4, 15) // May 15, 2023
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()

    // Get days in month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    // Get first day of month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()

    // Create calendar days array
    const calendarDays = []

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push({ day: "", isCurrentMonth: false })
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push({ day: i, isCurrentMonth: true })
    }

    // Find events for each day
    const eventsByDay = {}
    workSessions.forEach((session) => {
      const day = session.start.getDate()
      const month = session.start.getMonth()
      const year = session.start.getFullYear()

      if (month === currentMonth && year === currentYear) {
        if (!eventsByDay[day]) {
          eventsByDay[day] = []
        }
        eventsByDay[day].push(session)
      }
    })

    return (
      <div className="border rounded-md overflow-hidden">
        <div className="bg-muted p-4 flex justify-between items-center">
          <button className="px-2 py-1 rounded hover:bg-background">◀ Back</button>
          <h3 className="font-medium">May 2023</h3>
          <button className="px-2 py-1 rounded hover:bg-background">Next ▶</button>
        </div>

        <div className="grid grid-cols-7 bg-muted/50">
          {days.map((day) => (
            <div key={day} className="p-2 text-center font-medium border-b">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[80px] p-1 border-b border-r relative ${
                day.isCurrentMonth ? "" : "bg-muted/30 text-muted-foreground"
              } ${day.day === 15 ? "bg-muted/50" : ""}`}
            >
              {day.day && (
                <>
                  <div className="text-sm p-1">{day.day}</div>
                  {eventsByDay[day.day]?.map((event, i) => (
                    <div
                      key={i}
                      className="text-xs p-1 mb-1 bg-primary text-primary-foreground rounded truncate"
                      title={event.title}
                    >
                      {event.title}
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Timeline & Scheduling</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="gantt">Gantt Chart</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
          </TabsList>
          <TabsContent value="gantt">{renderGanttChart()}</TabsContent>
          <TabsContent value="milestones">{renderMilestones()}</TabsContent>
          <TabsContent value="calendar">{renderCalendar()}</TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

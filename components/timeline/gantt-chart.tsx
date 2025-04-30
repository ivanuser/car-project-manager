"use client"

import { useState, useEffect } from "react"
import { Gantt, type Task, ViewMode } from "gantt-task-react"
import "gantt-task-react/dist/index.css"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface GanttChartProps {
  timelineItems: any[]
  projectId: string
}

export function GanttChart({ timelineItems, projectId }: GanttChartProps) {
  const [view, setView] = useState<ViewMode>(ViewMode.Month)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Convert timeline items to Gantt tasks
    const convertedTasks = timelineItems.map((item) => {
      return {
        id: item.id,
        name: item.title,
        start: new Date(item.start_date),
        end: new Date(item.end_date),
        progress: item.progress / 100,
        type: item.type === "milestone" ? "milestone" : "task",
        isDisabled: false,
        styles: {
          progressColor: item.is_critical_path ? "#ef4444" : undefined,
          progressSelectedColor: item.is_critical_path ? "#b91c1c" : undefined,
        },
        project: item.parent_id || "",
        dependencies: item.dependencies || [],
      }
    })

    setTasks(convertedTasks)
    setIsLoaded(true)
  }, [timelineItems])

  const handleTaskChange = (task: Task) => {
    console.log("Task changed:", task)
    // Here you would update the task in the database
  }

  const handleViewChange = (newView: string) => {
    switch (newView) {
      case "hour":
        setView(ViewMode.Hour)
        break
      case "quarterDay":
        setView(ViewMode.QuarterDay)
        break
      case "halfDay":
        setView(ViewMode.HalfDay)
        break
      case "day":
        setView(ViewMode.Day)
        break
      case "week":
        setView(ViewMode.Week)
        break
      case "month":
        setView(ViewMode.Month)
        break
      case "year":
        setView(ViewMode.Year)
        break
      default:
        setView(ViewMode.Month)
    }
  }

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Project Timeline</CardTitle>
        <div className="flex items-center space-x-2">
          <Select defaultValue="month" onValueChange={handleViewChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="View Mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
              <SelectItem value="year">Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" asChild>
            <a href={`/dashboard/projects/${projectId}/timeline/edit`}>Edit Timeline</a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <p className="text-muted-foreground">No timeline items found. Add tasks or milestones to see them here.</p>
          </div>
        ) : (
          <div className="gantt-container">
            <Gantt
              tasks={tasks}
              viewMode={view}
              onDateChange={handleTaskChange}
              onProgressChange={handleTaskChange}
              onDoubleClick={() => {}}
              onSelect={() => {}}
              listCellWidth=""
              columnWidth={60}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

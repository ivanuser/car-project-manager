"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, AlertCircle } from "lucide-react"

interface TimelineItem {
  id: string
  title: string
  start_date: string
  end_date: string
  progress: number
  type: string
  is_critical_path?: boolean
  parent_id?: string
  dependencies?: string[]
}

interface GanttChartProps {
  timelineItems: TimelineItem[]
  projectId: string
}

export function GanttChart({ timelineItems, projectId }: GanttChartProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getProgressColor = (progress: number, isCritical?: boolean) => {
    if (isCritical) return "bg-red-500"
    if (progress >= 100) return "bg-green-500"
    if (progress >= 75) return "bg-blue-500"
    if (progress >= 50) return "bg-yellow-500"
    return "bg-gray-300"
  }

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Project Timeline
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <a href={`/dashboard/projects/${projectId}/timeline/edit`}>Edit Timeline</a>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {timelineItems.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No timeline items found.</p>
              <p className="text-sm text-muted-foreground">Add tasks or milestones to see them here.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              Showing {timelineItems.length} timeline items
            </div>
            
            {timelineItems.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${item.is_critical_path ? 'bg-red-500' : 'bg-blue-500'}`} />
                    <h4 className="font-medium">{item.title}</h4>
                    {item.is_critical_path && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        <AlertCircle className="h-3 w-3" />
                        Critical Path
                      </div>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {item.type === "milestone" ? "Milestone" : "Task"}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Start: {formatDate(item.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>End: {formatDate(item.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Duration: {getDuration(item.start_date, item.end_date)} days</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>Progress</span>
                    <span>{Math.round(item.progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(item.progress, item.is_critical_path)}`}
                      style={{ width: `${Math.min(100, Math.max(0, item.progress))}%` }}
                    />
                  </div>
                </div>
                
                {item.dependencies && item.dependencies.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Dependencies: {item.dependencies.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

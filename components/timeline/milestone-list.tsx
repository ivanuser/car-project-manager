"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Circle, Flag, Plus } from "lucide-react"
import Link from "next/link"

interface MilestoneListProps {
  milestones: any[]
  projectId: string
}

export function MilestoneList({ milestones, projectId }: MilestoneListProps) {
  const [filter, setFilter] = useState<"all" | "completed" | "upcoming">("all")

  const filteredMilestones = milestones.filter((milestone) => {
    if (filter === "all") return true
    \
    if (filter === "completed\") return milestone.complete  => {
    if (filter === "all") return true
    if (filter === "completed") return milestone.completed_at
    if (filter === "upcoming") return !milestone.completed_at
  })

  // Sort milestones by due date
  const sortedMilestones = [...filteredMilestones].sort((a, b) => {
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle>Project Milestones</CardTitle>
        <div className="flex items-center space-x-2">
          <div className="flex rounded-md border">
            <Button
              variant={filter === "all" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "upcoming" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-none border-x"
              onClick={() => setFilter("upcoming")}
            >
              Upcoming
            </Button>
            <Button
              variant={filter === "completed" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setFilter("completed")}
            >
              Completed
            </Button>
          </div>
          <Button size="sm" asChild>
            <Link href={`/dashboard/projects/${projectId}/milestones/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Milestone
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {sortedMilestones.length === 0 ? (
          <div className="flex h-32 items-center justify-center">
            <p className="text-muted-foreground">No milestones found. Add your first milestone to track progress.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedMilestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-start justify-between rounded-lg border p-4 hover:bg-muted/50"
              >
                <div className="flex items-start space-x-4">
                  <div className="mt-0.5">
                    {milestone.completed_at ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : milestone.is_critical ? (
                      <Flag className="h-5 w-5 text-red-500" />
                    ) : (
                      <Circle className="h-5 w-5 text-blue-500" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium">{milestone.title}</h3>
                      {milestone.is_critical && <Badge variant="destructive">Critical</Badge>}
                    </div>
                    {milestone.description && <p className="text-sm text-muted-foreground">{milestone.description}</p>}
                    <div className="mt-1 flex items-center space-x-2 text-sm">
                      <span className="text-muted-foreground">Due: {format(new Date(milestone.due_date), "PPP")}</span>
                      {milestone.completed_at && (
                        <span className="text-green-600">
                          Completed: {format(new Date(milestone.completed_at), "PPP")}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/projects/${projectId}/milestones/${milestone.id}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

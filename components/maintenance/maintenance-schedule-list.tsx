"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { AlertCircle, CheckCircle2, Clock, Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { deleteMaintenanceSchedule, type MaintenanceSchedule } from "@/actions/maintenance-actions"
import { useToast } from "@/hooks/use-toast"

interface MaintenanceScheduleListProps {
  schedules: MaintenanceSchedule[]
  projectId: string
}

export function MaintenanceScheduleList({ schedules, projectId }: MaintenanceScheduleListProps) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    try {
      const result = await deleteMaintenanceSchedule(id, projectId)
      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Maintenance schedule deleted successfully",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete maintenance schedule",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500"
      case "due":
        return "bg-yellow-500"
      case "overdue":
        return "bg-red-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "due":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <p className="mb-4 text-center text-muted-foreground">No maintenance schedules found</p>
          <Button asChild>
            <Link href={`/dashboard/projects/${projectId}/maintenance/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Maintenance Schedule
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <Card key={schedule.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(schedule.status)}
                  {schedule.title}
                </CardTitle>
                <CardDescription>{schedule.description}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/projects/${projectId}/maintenance/${schedule.id}/log`}>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Log Completion
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/projects/${projectId}/maintenance/${schedule.id}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Schedule
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(schedule.id)}
                    disabled={isDeleting === schedule.id}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isDeleting === schedule.id ? "Deleting..." : "Delete"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Interval</p>
                <p className="text-sm">
                  Every {schedule.interval_value} {schedule.interval_type}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Last Performed</p>
                <p className="text-sm">
                  {schedule.last_performed_at
                    ? `${format(new Date(schedule.last_performed_at), "MMM d, yyyy")} (${
                        schedule.last_performed_value
                      } ${schedule.interval_type})`
                    : "Never"}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Next Due</p>
                <p className="text-sm">
                  {schedule.next_due_at
                    ? `${format(new Date(schedule.next_due_at), "MMM d, yyyy")} (${
                        schedule.next_due_value
                      } ${schedule.interval_type})`
                    : "Not scheduled"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between pt-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={getPriorityColor(schedule.priority)}>
                {schedule.priority.charAt(0).toUpperCase() + schedule.priority.slice(1)} Priority
              </Badge>
              <Badge className={`${getStatusColor(schedule.status)} text-white`}>
                {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
              </Badge>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/projects/${projectId}/maintenance/${schedule.id}/log`}>Log Completion</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

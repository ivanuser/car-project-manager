"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { CheckCircle2, Clock, Edit, MoreHorizontal, PlayCircle, Trash2, XCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { deleteTask, updateTaskStatus } from "@/actions/project-actions"

// Define task and status types
export type TaskStatus = "todo" | "in_progress" | "completed" | "blocked"

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: "low" | "medium" | "high"
  project_id?: string
  build_stage?: string
  due_date?: string
  estimated_hours?: number
  created_at: string
  updated_at: string
}

type TaskListProps = {
  tasks: Task[]
  projectId?: string
  showProject?: boolean
}

export function TaskList({ tasks, projectId, showProject = false }: TaskListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null)

  const handleStatusChange = async (taskId: string, status: TaskStatus) => {
    setUpdatingTaskId(taskId)
    try {
      const result = await updateTaskStatus(taskId, status, projectId || "")
      if (result.success) {
        toast({
          title: "Status updated",
          description: "Task status has been updated successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update task status",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating task status:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setUpdatingTaskId(null)
    }
  }

  const confirmDelete = (task: Task) => {
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!taskToDelete) return

    setIsDeleting(true)
    try {
      const result = await deleteTask(taskToDelete.id, projectId || "")
      if (result.success) {
        toast({
          title: "Task deleted",
          description: `Task "${taskToDelete.title}" has been deleted`,
        })
        setDeleteDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete task",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting task:", error)
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case "todo":
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-800">
            To Do
          </Badge>
        )
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Completed
          </Badge>
        )
      case "blocked":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Blocked
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getBuildStageBadge = (stage: string | null) => {
    if (!stage) return null

    const stageColors: Record<string, string> = {
      planning: "bg-purple-100 text-purple-800",
      teardown: "bg-orange-100 text-orange-800",
      fabrication: "bg-yellow-100 text-yellow-800",
      assembly: "bg-blue-100 text-blue-800",
      paint: "bg-pink-100 text-pink-800",
      electrical: "bg-cyan-100 text-cyan-800",
      interior: "bg-indigo-100 text-indigo-800",
      testing: "bg-amber-100 text-amber-800",
      complete: "bg-green-100 text-green-800",
    }

    return (
      <Badge variant="outline" className={stageColors[stage] || "bg-gray-100 text-gray-800"}>
        {stage.charAt(0).toUpperCase() + stage.slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null

    const priorityColors: Record<string, string> = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    }

    return (
      <Badge variant="outline" className={priorityColors[priority] || "bg-gray-100 text-gray-800"}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              {showProject && <TableHead>Project</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead>Build Stage</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showProject ? 7 : 6} className="h-24 text-center">
                  No tasks found
                </TableCell>
              </TableRow>
            ) : (
              tasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  {showProject && (
                    <TableCell>
                      <Link href={`/dashboard/projects/${task.project_id}`} className="text-blue-600 hover:underline">
                        View Project
                      </Link>
                    </TableCell>
                  )}
                  <TableCell>{getStatusBadge(task.status as TaskStatus)}</TableCell>
                  <TableCell>{getBuildStageBadge(task.build_stage)}</TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>{task.due_date ? format(new Date(task.due_date), "MMM d, yyyy") : "-"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/tasks/${task.id}/edit`)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(task.id, "todo")}
                          disabled={task.status === "todo" || updatingTaskId === task.id}
                        >
                          <Clock className="mr-2 h-4 w-4" />
                          Mark as To Do
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(task.id, "in_progress")}
                          disabled={task.status === "in_progress" || updatingTaskId === task.id}
                        >
                          <PlayCircle className="mr-2 h-4 w-4" />
                          Mark as In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(task.id, "completed")}
                          disabled={task.status === "completed" || updatingTaskId === task.id}
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Mark as Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(task.id, "blocked")}
                          disabled={task.status === "blocked" || updatingTaskId === task.id}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Mark as Blocked
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => confirmDelete(task)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the task "{taskToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

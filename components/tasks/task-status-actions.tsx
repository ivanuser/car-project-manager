"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateTaskStatus, deleteTask } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { CheckCircle, Clock, AlertTriangle, ListTodo, MoreHorizontal, Trash } from "lucide-react"

interface TaskStatusActionsProps {
  taskId: string
  currentStatus: string
  projectId: string
}

export default function TaskStatusActions({ taskId, currentStatus, projectId }: TaskStatusActionsProps) {
  const router = useRouter()
  const [isUpdating, setIsUpdating] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  async function handleStatusChange(newStatus: string) {
    setIsUpdating(true)
    try {
      await updateTaskStatus(taskId, newStatus, projectId)
    } catch (error) {
      console.error("Error updating task status:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  async function handleDelete() {
    try {
      await deleteTask(taskId, projectId)
      router.push("/dashboard/tasks")
    } catch (error) {
      console.error("Error deleting task:", error)
    }
  }

  return (
    <>
      <div className="flex space-x-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isUpdating}>
              <MoreHorizontal className="mr-2 h-4 w-4" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => handleStatusChange("todo")}
              disabled={currentStatus === "todo"}
              className="flex items-center"
            >
              <ListTodo className="mr-2 h-4 w-4" />
              To Do
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("in_progress")}
              disabled={currentStatus === "in_progress"}
              className="flex items-center"
            >
              <Clock className="mr-2 h-4 w-4" />
              In Progress
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("completed")}
              disabled={currentStatus === "completed"}
              className="flex items-center"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Completed
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleStatusChange("blocked")}
              disabled={currentStatus === "blocked"}
              className="flex items-center"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Blocked
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600 flex items-center">
              <Trash className="mr-2 h-4 w-4" />
              Delete Task
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

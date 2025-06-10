"use client"

import { useState } from "react"
import { Clock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"

interface Task {
  id: string
  title: string
  project: string
  dueDate: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
}

interface DemoTaskListProps {
  limit?: number
  filter?: "upcoming" | "completed"
}

export function DemoTaskList({ limit = 10, filter }: DemoTaskListProps) {
  // Sample tasks data
  const initialTasks: Task[] = [
    {
      id: "1",
      title: "Order new carburetor",
      project: "Mustang Restoration",
      dueDate: "2023-05-15",
      status: "todo",
      priority: "high",
    },
    {
      id: "2",
      title: "Install suspension kit",
      project: "Jeep Wrangler Build",
      dueDate: "2023-05-18",
      status: "completed",
      priority: "medium",
    },
    {
      id: "3",
      title: "Rebuild transmission",
      project: "BMW Engine Swap",
      dueDate: "2023-05-20",
      status: "in-progress",
      priority: "high",
    },
    {
      id: "4",
      title: "Paint interior trim pieces",
      project: "Mustang Restoration",
      dueDate: "2023-05-22",
      status: "todo",
      priority: "low",
    },
    {
      id: "5",
      title: "Install new exhaust system",
      project: "BMW Engine Swap",
      dueDate: "2023-05-25",
      status: "todo",
      priority: "medium",
    },
    {
      id: "6",
      title: "Replace brake pads and rotors",
      project: "Jeep Wrangler Build",
      dueDate: "2023-05-28",
      status: "todo",
      priority: "high",
    },
    {
      id: "7",
      title: "Reupholster seats",
      project: "Mustang Restoration",
      dueDate: "2023-06-01",
      status: "todo",
      priority: "medium",
    },
    {
      id: "8",
      title: "Install lift kit",
      project: "Jeep Wrangler Build",
      dueDate: "2023-06-05",
      status: "todo",
      priority: "high",
    },
    {
      id: "9",
      title: "Tune ECU",
      project: "BMW Engine Swap",
      dueDate: "2023-06-08",
      status: "todo",
      priority: "medium",
    },
    {
      id: "10",
      title: "Replace fuel pump",
      project: "Mustang Restoration",
      dueDate: "2023-06-10",
      status: "todo",
      priority: "high",
    },
  ]

  const [tasks, setTasks] = useState<Task[]>(initialTasks)

  // Filter tasks based on props
  let filteredTasks = tasks
  if (filter === "upcoming") {
    filteredTasks = tasks.filter((task) => task.status !== "completed")
  } else if (filter === "completed") {
    filteredTasks = tasks.filter((task) => task.status === "completed")
  }

  // Limit the number of tasks
  filteredTasks = filteredTasks.slice(0, limit)

  // Toggle task completion
  const toggleTaskStatus = (taskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            status: task.status === "completed" ? "todo" : "completed",
          }
        }
        return task
      }),
    )
  }

  // Get badge color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 hover:bg-red-600"
      case "medium":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "low":
        return "bg-green-500 hover:bg-green-600"
      default:
        return "bg-slate-500 hover:bg-slate-600"
    }
  }

  return (
    <div className="space-y-4">
      {filteredTasks.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground">No tasks found</div>
      ) : (
        filteredTasks.map((task) => (
          <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-3">
              <Checkbox checked={task.status === "completed"} onCheckedChange={() => toggleTaskStatus(task.id)} />
              <div>
                <p className={task.status === "completed" ? "line-through text-muted-foreground" : ""}>{task.title}</p>
                <p className="text-xs text-muted-foreground">{task.project}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{task.dueDate}</span>
              </Badge>
              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

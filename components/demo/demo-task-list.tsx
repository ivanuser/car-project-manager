"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface Task {
  id: string
  title: string
  project: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  dueDate: string
}

const demoTasks: Task[] = [
  {
    id: "1",
    title: "Replace Carburetor",
    project: "1967 Mustang Restoration",
    status: "in-progress",
    priority: "high",
    dueDate: "Tomorrow",
  },
  {
    id: "2",
    title: "Rebuild Transmission",
    project: "1967 Mustang Restoration",
    status: "todo",
    priority: "medium",
    dueDate: "Next week",
  },
  {
    id: "3",
    title: "Install Coilovers",
    project: "BMW M3 Performance Upgrade",
    status: "todo",
    priority: "high",
    dueDate: "In 2 days",
  },
  {
    id: "4",
    title: "ECU Tuning",
    project: "BMW M3 Performance Upgrade",
    status: "todo",
    priority: "medium",
    dueDate: "Next week",
  },
  {
    id: "5",
    title: "Install Lift Kit",
    project: "Jeep Wrangler Off-Road Build",
    status: "todo",
    priority: "high",
    dueDate: "In 5 days",
  },
  {
    id: "6",
    title: "Replace Brake Pads",
    project: "1967 Mustang Restoration",
    status: "completed",
    priority: "high",
    dueDate: "Last week",
  },
  {
    id: "7",
    title: "Install New Exhaust",
    project: "BMW M3 Performance Upgrade",
    status: "completed",
    priority: "medium",
    dueDate: "2 weeks ago",
  },
]

export function DemoTaskList() {
  const [tasks, setTasks] = useState(demoTasks)

  const toggleTaskStatus = (taskId: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const newStatus = task.status === "completed" ? "todo" : "completed"
          return { ...task, status: newStatus }
        }
        return task
      }),
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="todo">To Do</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-full p-0 text-muted-foreground"
                  onClick={() => toggleTaskStatus(task.id)}
                >
                  {task.status === "completed" ? (
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                  <span className="sr-only">Toggle task</span>
                </Button>

                <div className="flex-1 space-y-1">
                  <p
                    className={`text-sm font-medium leading-none ${task.status === "completed" ? "line-through text-muted-foreground" : ""}`}
                  >
                    {task.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{task.project}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    <span>{task.dueDate}</span>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="todo" className="space-y-4">
            {tasks
              .filter((t) => t.status === "todo")
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full p-0 text-muted-foreground"
                    onClick={() => toggleTaskStatus(task.id)}
                  >
                    <Circle className="h-5 w-5" />
                    <span className="sr-only">Toggle task</span>
                  </Button>

                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.project}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
          </TabsContent>

          <TabsContent value="in-progress" className="space-y-4">
            {tasks
              .filter((t) => t.status === "in-progress")
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full p-0 text-muted-foreground"
                    onClick={() => toggleTaskStatus(task.id)}
                  >
                    <Circle className="h-5 w-5" />
                    <span className="sr-only">Toggle task</span>
                  </Button>

                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.project}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {tasks
              .filter((t) => t.status === "completed")
              .map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full p-0 text-muted-foreground"
                    onClick={() => toggleTaskStatus(task.id)}
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    <span className="sr-only">Toggle task</span>
                  </Button>

                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none line-through text-muted-foreground">{task.title}</p>
                    <p className="text-xs text-muted-foreground">{task.project}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      <span>{task.dueDate}</span>
                    </div>
                  </div>
                </div>
              ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

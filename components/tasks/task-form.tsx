"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { createTask, updateTask } from "@/actions/project-actions"

// Define the form schema with Zod
const taskFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "completed", "blocked"]),
  priority: z.enum(["low", "medium", "high"]),
  projectId: z.string().optional(),
  buildStage: z.string().optional(),
  dueDate: z.date().optional(),
  estimatedHours: z.coerce.number().min(0).optional(),
})

// Infer the type from the schema
type TaskFormValues = z.infer<typeof taskFormSchema>

// Define the default values
const defaultValues: Partial<TaskFormValues> = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  projectId: undefined,
  buildStage: undefined,
  dueDate: undefined,
  estimatedHours: undefined,
}

// Define the props for the TaskForm component
interface TaskFormProps {
  task?: any
  projects: any[]
  projectId?: string
}

// Define the build stages
const buildStages = [
  "planning",
  "disassembly",
  "cleaning",
  "repair",
  "fabrication",
  "painting",
  "assembly",
  "electrical",
  "testing",
  "finishing",
]

export function TaskForm({ task, projects, projectId }: TaskFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize the form with react-hook-form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || "",
          status: task.status,
          priority: task.priority,
          projectId: task.project_id || projectId,
          buildStage: task.build_stage,
          dueDate: task.due_date ? new Date(task.due_date) : undefined,
          estimatedHours: task.estimated_hours,
        }
      : {
          ...defaultValues,
          projectId: projectId,
        },
  })

  // Handle form submission
  async function onSubmit(data: TaskFormValues) {
    console.log("TaskForm: Starting task submission with data:", data)
    setIsSubmitting(true)
    try {
      // Convert form data to FormData object for server actions
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description || "")
      formData.append("status", data.status)
      formData.append("priority", data.priority)
      if (data.projectId) {
        formData.append("projectId", data.projectId)
        console.log("TaskForm: Using project ID:", data.projectId)
      } else {
        console.error("TaskForm: No project ID provided!")
      }
      if (data.buildStage) {
        formData.append("buildStage", data.buildStage)
      }
      if (data.dueDate) {
        formData.append("dueDate", data.dueDate.toISOString())
      }
      if (data.estimatedHours) {
        formData.append("estimatedHours", data.estimatedHours.toString())
      }

      if (task) {
        // Update existing task
        console.log("TaskForm: Updating existing task:", task.id)
        const result = await updateTask(task.id, formData)
        console.log("TaskForm: Update result:", result)
        if (result.error) {
          throw new Error(result.error)
        }
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        })
        router.push(`/dashboard/tasks/${task.id}`)
        router.refresh()
      } else {
        // Create new task
        console.log("TaskForm: Creating new task")
        const result = await createTask(formData)
        console.log("TaskForm: Create result:", result)
        if (result.error) {
          throw new Error(result.error)
        }
        toast({
          title: "Task created",
          description: "Your task has been created successfully.",
        })
        if (projectId) {
          router.push(`/dashboard/projects/${projectId}`)
        } else {
          router.push("/dashboard/tasks")
        }
        router.refresh()
      }
    } catch (error) {
      console.error("Error submitting task:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error submitting your task. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
              </FormControl>
              <FormDescription>A clear, concise title for your task.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter task description" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormDescription>Detailed description of what needs to be done.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Current status of the task.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>How important is this task?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!projectId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Which project does this task belong to?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="buildStage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Build Stage</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select build stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {buildStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage.charAt(0).toUpperCase() + stage.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Which stage of the build process?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormDescription>When does this task need to be completed?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Hours</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.5" placeholder="Enter estimated hours" {...field} />
                </FormControl>
                <FormDescription>How many hours do you expect this to take?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (projectId) {
                router.push(`/dashboard/projects/${projectId}`)
              } else {
                router.push("/dashboard/tasks")
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : task ? "Update Task" : "Create Task"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import {
  createMaintenanceSchedule,
  updateMaintenanceSchedule,
  type MaintenanceSchedule,
} from "@/actions/maintenance-actions"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  interval_type: z.enum(["miles", "months", "hours"]),
  interval_value: z.number().min(1, "Interval value must be at least 1"),
  last_performed_at: z.date(),
  last_performed_value: z.number().min(0, "Value must be at least 0"),
  priority: z.enum(["low", "medium", "high", "critical"]),
})

type FormValues = z.infer<typeof formSchema>

interface MaintenanceScheduleFormProps {
  projectId: string
  schedule?: MaintenanceSchedule
}

export function MaintenanceScheduleForm({ projectId, schedule }: MaintenanceScheduleFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<FormValues> = {
    title: schedule?.title || "",
    description: schedule?.description || "",
    interval_type: schedule?.interval_type || "miles",
    interval_value: schedule?.interval_value || 3000,
    last_performed_at: schedule?.last_performed_at ? new Date(schedule.last_performed_at) : new Date(),
    last_performed_value: schedule?.last_performed_value || 0,
    priority: schedule?.priority || "medium",
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("project_id", projectId)
      formData.append("title", values.title)
      formData.append("description", values.description || "")
      formData.append("interval_type", values.interval_type)
      formData.append("interval_value", values.interval_value.toString())
      formData.append("last_performed_at", values.last_performed_at.toISOString())
      formData.append("last_performed_value", values.last_performed_value.toString())
      formData.append("priority", values.priority)

      let result
      if (schedule?.id) {
        formData.append("id", schedule.id)
        result = await updateMaintenanceSchedule(formData)
      } else {
        result = await createMaintenanceSchedule(formData)
      }

      if (result?.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result?.success) {
        toast({
          title: "Success",
          description: schedule ? "Maintenance schedule updated successfully" : "Maintenance schedule created successfully",
        })
        
        // Navigate back to project maintenance page
        router.push(`/dashboard/projects/${projectId}/maintenance`)
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
              <FormLabel>Maintenance Title</FormLabel>
              <FormControl>
                <Input placeholder="Oil Change" {...field} />
              </FormControl>
              <FormDescription>Enter a descriptive title for this maintenance task</FormDescription>
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
                <Textarea placeholder="Change oil and replace oil filter" className="min-h-24" {...field} />
              </FormControl>
              <FormDescription>Provide details about what this maintenance involves</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="interval_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interval Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select interval type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="miles">Miles</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                    <SelectItem value="hours">Hours</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>How to measure the maintenance interval</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="interval_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interval Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    placeholder="3000"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>How often this maintenance should be performed</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="last_performed_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Last Performed Date</FormLabel>
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
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>When was this maintenance last performed?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="last_performed_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Performed Value</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="30000"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>The odometer/hour reading when last performed</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>How important is this maintenance task?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : schedule ? "Update Schedule" : "Create Schedule"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

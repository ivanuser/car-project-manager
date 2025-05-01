"use client"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { logMaintenanceCompletion, type MaintenanceSchedule } from "@/actions/maintenance-actions"

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  performed_at: z.date(),
  performed_value: z.number().min(0, "Value must be at least 0"),
  cost: z.number().min(0, "Cost must be at least 0").optional(),
  notes: z.string().optional(),
  parts_used: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface MaintenanceLogFormProps {
  projectId: string
  schedule: MaintenanceSchedule
}

export function MaintenanceLogForm({ projectId, schedule }: MaintenanceLogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<FormValues> = {
    title: schedule.title,
    description: schedule.description || "",
    performed_at: new Date(),
    performed_value: schedule.last_performed_value || 0,
    cost: 0,
    notes: "",
    parts_used: "",
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("schedule_id", schedule.id)
    formData.append("project_id", projectId)
    formData.append("title", values.title)
    formData.append("description", values.description || "")
    formData.append("performed_at", values.performed_at.toISOString())
    formData.append("performed_value", values.performed_value.toString())
    formData.append("cost", values.cost?.toString() || "0")
    formData.append("notes", values.notes || "")

    // Split parts used by commas and add each part
    if (values.parts_used) {
      const parts = values.parts_used.split(",").map((part) => part.trim())
      parts.forEach((part) => {
        if (part) formData.append("parts_used", part)
      })
    }

    await logMaintenanceCompletion(formData)
    setIsSubmitting(false)
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
                <Textarea placeholder="Changed oil and replaced oil filter" className="min-h-24" {...field} />
              </FormControl>
              <FormDescription>Provide details about what was done</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="performed_at"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date Performed</FormLabel>
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
                <FormDescription>When was this maintenance performed?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="performed_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {schedule.interval_type === "miles"
                    ? "Odometer Reading"
                    : schedule.interval_type === "hours"
                      ? "Hour Reading"
                      : "Current Value"}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="30000"
                    {...field}
                    onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  The current {schedule.interval_type === "miles" ? "mileage" : schedule.interval_type} reading
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="cost"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cost</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                />
              </FormControl>
              <FormDescription>How much did this maintenance cost?</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parts_used"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parts Used</FormLabel>
              <FormControl>
                <Input placeholder="Oil filter, Oil (5 quarts), Drain plug gasket" {...field} />
              </FormControl>
              <FormDescription>List parts used, separated by commas</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Additional notes about the maintenance" className="min-h-24" {...field} />
              </FormControl>
              <FormDescription>Any additional notes or observations</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Log Completion"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

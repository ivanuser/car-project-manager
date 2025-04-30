"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { updateProjectBudget, type ProjectBudget } from "@/actions/budget-actions"

const budgetSettingsSchema = z.object({
  totalBudget: z.string().refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) >= 0, {
    message: "Total budget must be a positive number",
  }),
  alertThreshold: z.number().min(1).max(100),
})

type BudgetSettingsFormValues = z.infer<typeof budgetSettingsSchema>

interface BudgetSettingsFormProps {
  projectId: string
  defaultValues?: ProjectBudget
}

export function BudgetSettingsForm({ projectId, defaultValues }: BudgetSettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<BudgetSettingsFormValues>({
    resolver: zodResolver(budgetSettingsSchema),
    defaultValues: {
      totalBudget: defaultValues?.total_budget ? defaultValues.total_budget.toString() : "0",
      alertThreshold: defaultValues?.alert_threshold || 80,
    },
  })

  async function onSubmit(data: BudgetSettingsFormValues) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("totalBudget", data.totalBudget)
      formData.append("alertThreshold", data.alertThreshold.toString())

      const result = await updateProjectBudget(projectId, formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success) {
        toast({
          title: "Success",
          description: "Budget settings updated successfully",
        })

        router.push(`/dashboard/projects/${projectId}/budget`)
        router.refresh()
      }
    } catch (error) {
      console.error("Budget settings submission error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Settings</CardTitle>
        <CardDescription>Configure your project budget and alert thresholds</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Total Budget */}
          <div className="space-y-2">
            <Label htmlFor="totalBudget">Total Budget</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="totalBudget"
                type="text"
                placeholder="5,000.00"
                className="pl-8"
                {...form.register("totalBudget")}
              />
            </div>
            {form.formState.errors.totalBudget && (
              <p className="text-sm text-error">{form.formState.errors.totalBudget.message}</p>
            )}
          </div>

          {/* Alert Threshold */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label htmlFor="alertThreshold">Alert Threshold</Label>
              <span className="text-sm font-medium">{form.watch("alertThreshold")}%</span>
            </div>
            <Slider
              id="alertThreshold"
              min={10}
              max={100}
              step={5}
              value={[form.watch("alertThreshold")]}
              onValueChange={(value) => form.setValue("alertThreshold", value[0])}
            />
            <p className="text-xs text-muted-foreground">
              You'll receive alerts when your spending reaches this percentage of your total budget
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

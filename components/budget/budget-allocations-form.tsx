"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { type BudgetCategory, updateBudgetAllocations } from "@/actions/budget-actions"
import { formatCurrency } from "@/utils/format-utils"

interface BudgetAllocationsFormProps {
  projectId: string
  categories: BudgetCategory[]
  totalBudget: number
  existingAllocations: {
    category_id: string
    allocated_amount: number
  }[]
}

interface Allocation {
  id: string
  categoryId: string
  amount: number
}

export function BudgetAllocationsForm({
  projectId,
  categories,
  totalBudget,
  existingAllocations,
}: BudgetAllocationsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [allocations, setAllocations] = useState<Allocation[]>(() => {
    if (existingAllocations.length > 0) {
      return existingAllocations.map((allocation, index) => ({
        id: `existing-${index}`,
        categoryId: allocation.category_id,
        amount: allocation.allocated_amount,
      }))
    } else {
      // Create default allocations if none exist
      return [{ id: "new-0", categoryId: "", amount: 0 }]
    }
  })
  const router = useRouter()
  const { toast } = useToast()

  const addAllocation = () => {
    setAllocations([...allocations, { id: `new-${Date.now()}`, categoryId: "", amount: 0 }])
  }

  const removeAllocation = (id: string) => {
    setAllocations(allocations.filter((allocation) => allocation.id !== id))
  }

  const updateAllocation = (id: string, field: "categoryId" | "amount", value: string | number) => {
    setAllocations(
      allocations.map((allocation) => (allocation.id === id ? { ...allocation, [field]: value } : allocation)),
    )
  }

  const getTotalAllocated = () => {
    return allocations.reduce((sum, allocation) => sum + allocation.amount, 0)
  }

  const getRemainingBudget = () => {
    return totalBudget - getTotalAllocated()
  }

  const getUsedCategories = () => {
    return allocations.map((allocation) => allocation.categoryId).filter(Boolean)
  }

  const getAvailableCategories = () => {
    const usedCategories = getUsedCategories()
    return categories.filter((category) => !usedCategories.includes(category.id))
  }

  async function onSubmit() {
    setIsLoading(true)

    try {
      // Filter out allocations with no category or amount
      const validAllocations = allocations.filter((allocation) => allocation.categoryId && allocation.amount > 0)

      const result = await updateBudgetAllocations(
        projectId,
        validAllocations.map((allocation) => ({
          categoryId: allocation.categoryId,
          amount: allocation.amount,
        })),
      )

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success) {
        toast({
          title: "Success",
          description: "Budget allocations updated successfully",
        })

        router.push(`/dashboard/projects/${projectId}/budget`)
        router.refresh()
      }
    } catch (error) {
      console.error("Budget allocations submission error:", error)
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
        <CardTitle>Budget Allocations</CardTitle>
        <CardDescription>Distribute your budget across different categories</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-md">
          <div>
            <p className="text-sm font-medium">Total Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Remaining Unallocated</p>
            <p className={`text-2xl font-bold ${getRemainingBudget() < 0 ? "text-error" : ""}`}>
              {formatCurrency(getRemainingBudget())}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Category Allocations</h3>
            <Button type="button" variant="outline" size="sm" onClick={addAllocation}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>

          {allocations.map((allocation, index) => (
            <div key={allocation.id} className="grid grid-cols-12 gap-4 items-end">
              <div className="col-span-6">
                <Label htmlFor={`category-${allocation.id}`}>Category</Label>
                <Select
                  value={allocation.categoryId}
                  onValueChange={(value) => updateAllocation(allocation.id, "categoryId", value)}
                >
                  <SelectTrigger id={`category-${allocation.id}`}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allocation.categoryId && (
                      <SelectItem value={allocation.categoryId}>
                        {categories.find((c) => c.id === allocation.categoryId)?.name || "Unknown"}
                      </SelectItem>
                    )}
                    {getAvailableCategories().map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-5">
                <Label htmlFor={`amount-${allocation.id}`}>Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id={`amount-${allocation.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    className="pl-8"
                    value={allocation.amount}
                    onChange={(e) => updateAllocation(allocation.id, "amount", Number.parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAllocation(allocation.id)}
                  disabled={allocations.length === 1}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}

          {getRemainingBudget() < 0 && (
            <p className="text-sm text-error">
              Warning: You have allocated ${Math.abs(getRemainingBudget()).toFixed(2)} more than your total budget.
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          className="bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Allocations"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

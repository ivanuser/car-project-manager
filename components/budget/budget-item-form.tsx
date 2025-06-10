"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Receipt, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { createBudgetItem, updateBudgetItem, type BudgetCategory, type BudgetItem } from "@/actions/budget-actions"

const budgetItemSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  amount: z.string().refine((val) => !isNaN(Number.parseFloat(val)) && Number.parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  estimatedAmount: z
    .string()
    .refine((val) => !val || !isNaN(Number.parseFloat(val)), {
      message: "Estimated amount must be a number",
    })
    .optional(),
  date: z.date(),
  categoryId: z.string().optional(),
  vendor: z.string().optional(),
  paymentMethod: z.string().optional(),
  status: z.string().optional(),
})

type BudgetItemFormValues = z.infer<typeof budgetItemSchema>

interface BudgetItemFormProps {
  projectId: string
  categories: BudgetCategory[]
  defaultValues?: BudgetItem
  isEditing?: boolean
}

const PAYMENT_METHODS = [
  { value: "credit_card", label: "Credit Card" },
  { value: "debit_card", label: "Debit Card" },
  { value: "cash", label: "Cash" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "paypal", label: "PayPal" },
  { value: "other", label: "Other" },
]

const STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "pending", label: "Pending" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

export function BudgetItemForm({ projectId, categories, defaultValues, isEditing = false }: BudgetItemFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [receipt, setReceipt] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(defaultValues?.receipt_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      amount: defaultValues?.amount ? defaultValues.amount.toString() : "",
      estimatedAmount: defaultValues?.estimated_amount ? defaultValues.estimated_amount.toString() : "",
      date: defaultValues?.date ? new Date(defaultValues.date) : new Date(),
      categoryId: defaultValues?.category_id || undefined,
      vendor: defaultValues?.vendor || "",
      paymentMethod: defaultValues?.payment_method || undefined,
      status: defaultValues?.status || "completed",
    },
  })

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setReceipt(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = () => {
        setReceiptPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeReceipt = () => {
    setReceipt(null)
    setReceiptPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function onSubmit(data: BudgetItemFormValues) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("projectId", projectId)
      formData.append("title", data.title)
      formData.append("description", data.description || "")
      formData.append("amount", data.amount)
      formData.append("estimatedAmount", data.estimatedAmount || "")
      formData.append("date", format(data.date, "yyyy-MM-dd"))
      formData.append("categoryId", data.categoryId || "")
      formData.append("vendor", data.vendor || "")
      formData.append("paymentMethod", data.paymentMethod || "")
      formData.append("status", data.status || "completed")

      if (receipt) {
        formData.append("receipt", receipt)
      }

      let result

      if (isEditing && defaultValues?.id) {
        result = await updateBudgetItem(defaultValues.id, formData)
      } else {
        result = await createBudgetItem(formData)
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success) {
        toast({
          title: "Success",
          description: isEditing ? "Expense updated successfully" : "Expense added successfully",
        })

        router.push(`/dashboard/projects/${projectId}/budget`)
        router.refresh()
      }
    } catch (error) {
      console.error("Budget item submission error:", error)
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
        <CardTitle>{isEditing ? "Edit Expense" : "Add New Expense"}</CardTitle>
        <CardDescription>{isEditing ? "Update expense details" : "Enter details for the new expense"}</CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Title and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Expense Title</Label>
              <Input id="title" placeholder="Oil Change" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-sm text-error">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input id="amount" type="text" placeholder="49.99" className="pl-8" {...form.register("amount")} />
              </div>
              {form.formState.errors.amount && (
                <p className="text-sm text-error">{form.formState.errors.amount.message}</p>
              )}
            </div>
          </div>

          {/* Category and Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Category</Label>
              <Select
                defaultValue={form.getValues("categoryId")}
                onValueChange={(value) => form.setValue("categoryId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !form.getValues("date") && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {form.getValues("date") ? format(form.getValues("date") as Date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={form.getValues("date") as Date}
                    onSelect={(date) => form.setValue("date", date as Date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Details about this expense..."
              rows={3}
              {...form.register("description")}
            />
          </div>

          {/* Estimated Amount */}
          <div className="space-y-2">
            <Label htmlFor="estimatedAmount">Estimated Amount (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="estimatedAmount"
                type="text"
                placeholder="50.00"
                className="pl-8"
                {...form.register("estimatedAmount")}
              />
            </div>
            {form.formState.errors.estimatedAmount && (
              <p className="text-sm text-error">{form.formState.errors.estimatedAmount.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              If you budgeted a different amount for this expense, enter it here for comparison
            </p>
          </div>

          {/* Vendor and Payment Method */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vendor">Vendor (Optional)</Label>
              <Input id="vendor" placeholder="AutoZone" {...form.register("vendor")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                defaultValue={form.getValues("paymentMethod")}
                onValueChange={(value) => form.setValue("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select defaultValue={form.getValues("status")} onValueChange={(value) => form.setValue("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Receipt Upload */}
          <div className="space-y-2">
            <Label>Receipt (Optional)</Label>
            <div className="flex flex-col items-center">
              {receiptPreview ? (
                <div className="relative w-full h-40 mb-2">
                  <img
                    src={receiptPreview || "/placeholder.svg"}
                    alt="Receipt"
                    className="w-full h-full object-contain rounded-md border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={removeReceipt}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-full h-40 border-2 border-dashed rounded-md flex items-center justify-center mb-2 bg-muted/50">
                  <Receipt className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleReceiptChange}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                {receiptPreview ? "Change Receipt" : "Upload Receipt"}
              </Button>
            </div>
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
                {isEditing ? "Saving..." : "Adding..."}
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Add Expense"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

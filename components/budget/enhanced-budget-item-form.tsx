"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Loader2, Plus, Receipt } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { createBudgetItem, updateBudgetItem } from "@/actions/budget-actions"
import { ReceiptUpload } from "@/components/expenses/receipt-upload"
import { scanReceipt, createExpenseFromReceipt } from "@/actions/expense-actions-new"
import { ReceiptScanner } from "@/components/expenses/receipt-scanner"

const budgetItemSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  amount: z.number().min(0.01, { message: "Amount must be greater than 0" }),
  estimatedAmount: z.number().optional(),
  date: z.date({ required_error: "Date is required" }),
  categoryId: z.string().min(1, { message: "Category is required" }),
  vendor: z.string().optional(),
  paymentMethod: z.string().optional(),
  status: z.string().default("completed"),
})

type BudgetItemFormValues = z.infer<typeof budgetItemSchema>

interface BudgetItemFormProps {
  projectId: string
  categories: any[]
  defaultValues?: Partial<BudgetItemFormValues> & { id?: string }
  isEditing?: boolean
  onSuccess?: () => void
}

export function EnhancedBudgetItemForm({
  projectId,
  categories,
  defaultValues,
  isEditing = false,
  onSuccess
}: BudgetItemFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showReceiptScanner, setShowReceiptScanner] = useState(false)
  const [budgetItemId, setBudgetItemId] = useState<string | undefined>(defaultValues?.id)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<BudgetItemFormValues>({
    resolver: zodResolver(budgetItemSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      amount: defaultValues?.amount || 0,
      estimatedAmount: defaultValues?.estimatedAmount || undefined,
      date: defaultValues?.date || new Date(),
      categoryId: defaultValues?.categoryId || "",
      vendor: defaultValues?.vendor || "",
      paymentMethod: defaultValues?.paymentMethod || "",
      status: defaultValues?.status || "completed",
    },
  })

  const handleReceiptScanComplete = (receiptData: any) => {
    // Populate form with scanned data
    if (receiptData.vendor) {
      form.setValue("vendor", receiptData.vendor)
    }
    if (receiptData.total) {
      form.setValue("amount", receiptData.total)
    }
    if (receiptData.date) {
      form.setValue("date", new Date(receiptData.date))
    }
    
    // Use the vendor name as title if no title is set
    if (receiptData.vendor && !form.getValues("title")) {
      form.setValue("title", `Expense from ${receiptData.vendor}`)
    }

    setShowReceiptScanner(false)

    toast({
      title: "Receipt scanned",
      description: "Form has been populated with receipt data",
    })
  }

  async function onSubmit(data: BudgetItemFormValues) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("projectId", projectId)
      formData.append("title", data.title)
      formData.append("description", data.description || "")
      formData.append("amount", data.amount.toString())
      formData.append("estimatedAmount", data.estimatedAmount?.toString() || "")
      formData.append("date", data.date.toISOString().split('T')[0])
      formData.append("categoryId", data.categoryId)
      formData.append("vendor", data.vendor || "")
      formData.append("paymentMethod", data.paymentMethod || "")
      formData.append("status", data.status)

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
        const itemId = result.data?.id
        if (itemId) {
          setBudgetItemId(itemId)
        }

        toast({
          title: "Success",
          description: isEditing ? "Budget item updated successfully" : "Budget item created successfully",
        })

        if (!isEditing) {
          form.reset()
        }

        onSuccess?.()
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {isEditing ? "Edit Budget Item" : "Add Budget Item"}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowReceiptScanner(!showReceiptScanner)}
              >
                <Receipt className="h-4 w-4 mr-2" />
                {showReceiptScanner ? "Hide Scanner" : "Scan Receipt"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showReceiptScanner && (
            <div className="mb-6">
              <ReceiptScanner onScanComplete={handleReceiptScanComplete} />
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Oil change" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Additional details about this expense..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estimatedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Amount (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="vendor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. AutoZone" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="paymentMethod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment method" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="credit_card">Credit Card</SelectItem>
                          <SelectItem value="debit_card">Debit Card</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <CardFooter className="flex justify-between px-0">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditing ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      {isEditing ? "Update Item" : "Create Item"}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Receipt Upload Section - Show after item is created/edited */}
      {budgetItemId && (
        <ReceiptUpload
          budgetItemId={budgetItemId}
          onUploadSuccess={(receiptUrl) => {
            toast({
              title: "Receipt uploaded",
              description: "Receipt has been attached to this expense",
            })
          }}
        />
      )}
    </div>
  )
}

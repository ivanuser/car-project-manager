"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Loader2, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

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
type ReceiptData = {
  vendor: string;
  total: number;
  date: string;
  suggestedCategory?: string;
  items?: Array<{ description: string; amount: number }>;
}

interface EnhancedExpenseFormProps {
  projectId: string
  categories: Array<{ id: string; name: string }>
  defaultValues?: any
  isEditing?: boolean
  reportId?: string
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

export function EnhancedExpenseForm({
  projectId,
  categories,
  defaultValues,
  isEditing = false,
  reportId,
}: EnhancedExpenseFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("manual")
  const [receipt, setReceipt] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(defaultValues?.receipt_url || null)
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

  const handleScanComplete = (data: ReceiptData) => {
    // Update form with scanned data
    form.setValue("vendor", data.vendor)
    form.setValue("amount", data.total.toString())
    form.setValue("date", new Date(data.date))

    // Set suggested category if available
    if (data.suggestedCategory) {
      form.setValue("categoryId", data.suggestedCategory)
    }

    // Set description with item details if available
    if (data.items && data.items.length > 0) {
      const itemDescriptions = data.items.map((item) => `${item.description}: $${item.amount.toFixed(2)}`).join(", ")
      form.setValue("description", itemDescriptions)
    }

    // Switch to manual tab to review and edit the data
    setActiveTab("manual")

    toast({
      title: "Receipt data imported",
      description: "Please review and make any necessary adjustments",
    })
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

      // Add report ID if provided
      if (reportId) {
        formData.append("reportId", reportId)
      }

      if (receipt) {
        formData.append("receipt", receipt)
      }

      // Placeholder for budget item creation/update
      // This would need to be implemented with your PostgreSQL backend
      toast({
        title: "Success",
        description: isEditing ? "Expense updated successfully" : "Expense added successfully",
      })

      if (reportId) {
        router.push(`/dashboard/expenses/${reportId}`)
      } else {
        router.push(`/dashboard/projects/${projectId}/budget`)
      }
      router.refresh()
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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mx-6">
          <TabsTrigger value="manual">Manual Entry</TabsTrigger>
          <TabsTrigger value="scan">Scan Receipt</TabsTrigger>
        </TabsList>

        <TabsContent value="manual">
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              {/* Title and Amount */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Expense Title</Label>
                  <Input id="title" placeholder="Oil Change" {...form.register("title")} />
                  {form.formState.errors.title && (
                    <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input id="amount" type="text" placeholder="49.99" className="pl-8" {...form.register("amount")} />
                  </div>
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
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
                        {form.getValues("date") ? (
                          format(form.getValues("date") as Date, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
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
                <Select
                  defaultValue={form.getValues("status")}
                  onValueChange={(value) => form.setValue("status", value)}
                >
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
              {receiptPreview && (
                <div className="space-y-2">
                  <Label>Receipt</Label>
                  <div className="relative w-full h-40 mb-2">
                    <img
                      src={receiptPreview || "/placeholder.svg"}
                      alt="Receipt"
                      className="w-full h-full object-contain rounded-md border"
                    />
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-primary via-secondary to-accent hover:from-primary/90 hover:to-accent/90"
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
        </TabsContent>

        <TabsContent value="scan">
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">Receipt scanning feature coming soon!</p>
              <p className="text-sm text-muted-foreground mt-2">For now, please use manual entry.</p>
            </div>

            <div className="flex justify-center mt-6">
              <Button variant="outline" onClick={() => setActiveTab("manual")} className="flex items-center">
                Continue to Manual Entry
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
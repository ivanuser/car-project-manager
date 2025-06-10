"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { FileText, Download, Check, X, Clock, AlertTriangle, Plus, Loader2, ChevronDown, Filter } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { BudgetItemsTable } from "@/components/budget/budget-items-table"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/utils/format-utils"
import { updateExpenseReportStatus, removeExpenseFromReport } from "@/actions/expense-actions"
import type { ExpenseReport } from "@/actions/expense-actions"

interface ExpenseReportProps {
  report: ExpenseReport
  projectId?: string
}

export function ExpenseReport({ report, projectId }: ExpenseReportProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleStatusChange = async (status: string) => {
    setIsSubmitting(true)

    try {
      const result = await updateExpenseReportStatus(report.id, status)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Report ${status === "submitted" ? "submitted" : status}`,
        })
        router.refresh()
      }
    } catch (error) {
      console.error("Error updating report status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    if (confirm("Are you sure you want to remove this expense from the report?")) {
      try {
        const result = await removeExpenseFromReport(report.id, itemId)

        if (result.error) {
          toast({
            title: "Error",
            description: result.error,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: "Expense removed from report",
          })
          router.refresh()
        }
      } catch (error) {
        console.error("Error removing expense from report:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred",
          variant: "destructive",
        })
      }
    }
  }

  const exportReport = () => {
    // Create CSV content
    const headers = ["Title", "Category", "Amount", "Date", "Vendor", "Payment Method", "Status"]
    const csvContent = [
      headers.join(","),
      ...report.items.map((item) =>
        [
          `"${item.title}"`,
          `"${item.category_name || "Uncategorized"}"`,
          item.amount,
          item.date,
          `"${item.vendor || ""}"`,
          `"${item.payment_method || ""}"`,
          `"${item.status}"`,
        ].join(","),
      ),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `expense-report-${report.id.slice(0, 8)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "submitted":
        return <Badge className="bg-warning text-warning-foreground">Submitted</Badge>
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>
      case "rejected":
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Clock className="h-5 w-5 text-muted-foreground" />
      case "submitted":
        return <AlertTriangle className="h-5 w-5 text-warning" />
      case "approved":
        return <Check className="h-5 w-5 text-success" />
      case "rejected":
        return <X className="h-5 w-5 text-destructive" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-muted">{getStatusIcon(report.status)}</div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight flex items-center gap-3">
              {report.title}
              {getStatusBadge(report.status)}
            </h2>
            <p className="text-muted-foreground">
              {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          {report.status === "draft" && (
            <>
              <Button size="sm" asChild>
                <Link href={`/dashboard/expenses/${report.id}/add`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Link>
              </Button>

              <Button
                size="sm"
                className="bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark"
                onClick={() => handleStatusChange("submitted")}
                disabled={isSubmitting || report.items.length === 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </>
          )}

          {report.status === "submitted" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline">
                  Actions
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange("approved")}>
                  <Check className="mr-2 h-4 w-4 text-success" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange("rejected")}>
                  <X className="mr-2 h-4 w-4 text-destructive" />
                  Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {(report.status === "approved" || report.status === "rejected") && (
            <Button size="sm" variant="outline" onClick={() => handleStatusChange("draft")}>
              <Clock className="mr-2 h-4 w-4" />
              Reopen as Draft
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(report.total_amount)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {report.items.length} {report.items.length === 1 ? "expense" : "expenses"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Report Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{report.status}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {report.status === "draft" && "Ready to submit"}
              {report.status === "submitted" && "Waiting for approval"}
              {report.status === "approved" && "Approved on " + new Date().toLocaleDateString()}
              {report.status === "rejected" && "Rejected on " + new Date().toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.project_id ? "Project Linked" : "No Project"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {report.project_id ? (
                <Link href={`/dashboard/projects/${report.project_id}`} className="text-primary hover:underline">
                  View Project
                </Link>
              ) : (
                "Personal expense report"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Expenses</CardTitle>
            <CardDescription>All expenses included in this report</CardDescription>
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Expenses</DropdownMenuItem>
                <DropdownMenuItem>By Category</DropdownMenuItem>
                <DropdownMenuItem>By Date</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          {report.items.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No expenses added yet</h3>
              <p className="text-muted-foreground mb-4">Add expenses to this report to get started</p>
              <Button asChild>
                <Link href={`/dashboard/expenses/${report.id}/add`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Link>
              </Button>
            </div>
          ) : (
            <BudgetItemsTable items={report.items} onDelete={handleRemoveItem} projectId={projectId || ""} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

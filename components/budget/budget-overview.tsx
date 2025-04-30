"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpDown, ChevronDown, Download, Filter, Plus, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { type BudgetSummary, type BudgetItem, deleteBudgetItem } from "@/actions/budget-actions"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/utils/format-utils"
import { BudgetItemsTable } from "./budget-items-table"
import { BudgetChart } from "./budget-chart"

interface BudgetOverviewProps {
  projectId: string
  summary: BudgetSummary
  items: BudgetItem[]
}

export function BudgetOverview({ projectId, summary, items }: BudgetOverviewProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const { toast } = useToast()

  const handleDeleteItem = async (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      const result = await deleteBudgetItem(id, projectId)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Expense deleted successfully",
        })
        router.refresh()
      }
    }
  }

  const exportBudgetData = () => {
    // Create CSV content
    const headers = ["Title", "Category", "Amount", "Date", "Vendor", "Payment Method", "Status"]
    const csvContent = [
      headers.join(","),
      ...items.map((item) =>
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
    link.setAttribute("download", `budget-export-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Calculate budget status color
  const getBudgetStatusColor = () => {
    const percentage = summary.budget_percentage_used
    if (percentage >= 100) return "text-error"
    if (percentage >= 80) return "text-warning"
    return "text-success"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Budget Management</h2>
          <p className="text-muted-foreground">Track and manage your project expenses</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={exportBudgetData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/projects/${projectId}/budget/settings`}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={`/dashboard/projects/${projectId}/budget/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.total_budget)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.total_budget > 0 ? "Budget set for this project" : "No budget set. Configure in settings."}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summary.total_spent)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {summary.total_budget > 0
                    ? `${Math.round(summary.budget_percentage_used)}% of total budget`
                    : "No budget reference available"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Remaining Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${getBudgetStatusColor()}`}>
                  {formatCurrency(summary.remaining_budget)}
                </div>
                <Progress
                  value={Math.min(summary.budget_percentage_used, 100)}
                  className="mt-2"
                  indicatorColor={
                    summary.budget_percentage_used >= 100
                      ? "bg-error"
                      : summary.budget_percentage_used >= 80
                        ? "bg-warning"
                        : "bg-success"
                  }
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Budget Breakdown</CardTitle>
              <CardDescription>Spending by category</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-80">
                <BudgetChart summary={summary} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
              <CardDescription>Your most recent project expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <BudgetItemsTable items={items.slice(0, 5)} onDelete={handleDeleteItem} projectId={projectId} />
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => setActiveTab("expenses")}>
                View All Expenses
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>All Expenses</CardTitle>
                <CardDescription>Complete list of project expenses</CardDescription>
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
                    <DropdownMenuItem>This Month</DropdownMenuItem>
                    <DropdownMenuItem>Last 3 Months</DropdownMenuItem>
                    <DropdownMenuItem>By Category</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                      Sort
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Date (Newest)</DropdownMenuItem>
                    <DropdownMenuItem>Date (Oldest)</DropdownMenuItem>
                    <DropdownMenuItem>Amount (High to Low)</DropdownMenuItem>
                    <DropdownMenuItem>Amount (Low to High)</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <BudgetItemsTable items={items} onDelete={handleDeleteItem} projectId={projectId} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Budget allocation and spending by category</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {summary.categories.map((category) => (
                  <div key={category.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{category.name}</div>
                      <div className="text-sm">
                        {formatCurrency(category.spent)} / {formatCurrency(category.allocated)}
                      </div>
                    </div>
                    <Progress
                      value={Math.min(category.percentage_used, 100)}
                      indicatorColor={
                        category.percentage_used >= 100
                          ? "bg-error"
                          : category.percentage_used >= 80
                            ? "bg-warning"
                            : "bg-success"
                      }
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <div>
                        {category.percentage_used > 0 ? `${Math.round(category.percentage_used)}% used` : "No spending"}
                      </div>
                      <div>
                        {category.remaining >= 0
                          ? `${formatCurrency(category.remaining)} remaining`
                          : `${formatCurrency(Math.abs(category.remaining))} over budget`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/projects/${projectId}/budget/allocations`}>Manage Category Allocations</Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

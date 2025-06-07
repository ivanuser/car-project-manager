import { Suspense } from "react"

// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'
import { getUserExpenseReports } from "@/actions/expense-actions"
import { ExpenseReportList } from "@/components/expenses/expense-report-list"
import { ExpenseAnalytics } from "@/components/expenses/expense-analytics"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ExpensesPage() {
  return (
    <Tabs defaultValue="reports" className="space-y-6">
      <TabsList>
        <TabsTrigger value="reports">Reports</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>

      <TabsContent value="reports">
        <Suspense fallback={<ExpensesSkeleton />}>
          <ExpensesContent />
        </Suspense>
      </TabsContent>

      <TabsContent value="analytics">
        <ExpenseAnalytics />
      </TabsContent>
    </Tabs>
  )
}

async function ExpensesContent() {
  const reports = await getUserExpenseReports()

  return <ExpenseReportList reports={reports} />
}

function ExpensesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-full mb-4" />
              <Skeleton className="h-4 w-3/4 mb-6" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-8 w-full mt-4" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

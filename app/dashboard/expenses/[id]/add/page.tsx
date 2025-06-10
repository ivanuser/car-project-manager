import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getExpenseReport } from "@/actions/expense-actions"
import { getBudgetCategories } from "@/actions/budget-actions"
import { EnhancedExpenseForm } from "@/components/expenses/enhanced-expense-form"
import { Skeleton } from "@/components/ui/skeleton"

interface AddExpensePageProps {
  params: {
    id: string
  }
}

export default async function AddExpensePage({ params }: AddExpensePageProps) {
  return (
    <Suspense fallback={<AddExpenseSkeleton />}>
      <AddExpenseContent id={params.id} />
    </Suspense>
  )
}

async function AddExpenseContent({ id }: { id: string }) {
  const [report, categories] = await Promise.all([getExpenseReport(id), getBudgetCategories()])

  if (!report) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add Expense to Report</h2>
        <p className="text-muted-foreground">Adding expense to report: {report.title}</p>
      </div>

      <EnhancedExpenseForm projectId={report.project_id || ""} categories={categories} reportId={id} />
    </div>
  )
}

function AddExpenseSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>

      <Skeleton className="h-[600px] w-full rounded-lg" />
    </div>
  )
}

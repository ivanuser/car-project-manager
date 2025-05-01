import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getExpenseReport } from "@/actions/expense-actions"
import { ExpenseReport } from "@/components/expenses/expense-report"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface ExpenseReportPageProps {
  params: {
    id: string
  }
}

export default async function ExpenseReportPage({ params }: ExpenseReportPageProps) {
  return (
    <Suspense fallback={<ExpenseReportSkeleton />}>
      <ExpenseReportContent id={params.id} />
    </Suspense>
  )
}

async function ExpenseReportContent({ id }: { id: string }) {
  const report = await getExpenseReport(id)

  if (!report) {
    notFound()
  }

  return <ExpenseReport report={report} projectId={report.project_id || undefined} />
}

function ExpenseReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-4 w-full mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-48 mb-4" />
          <Skeleton className="h-80 w-full" />
        </CardContent>
      </Card>
    </div>
  )
}

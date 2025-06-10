import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getVehicleProject } from "@/actions/project-actions"
import { getProjectBudgetItems, getProjectBudgetSummary } from "@/actions/budget-actions"
import { BudgetOverview } from "@/components/budget/budget-overview"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface BudgetPageProps {
  params: {
    id: string
  }
}

export default async function BudgetPage({ params }: BudgetPageProps) {
  const projectId = params.id
  const project = await getVehicleProject(projectId)

  if (!project) {
    notFound()
  }

  return (
    <Suspense fallback={<BudgetSkeleton />}>
      <BudgetContent projectId={projectId} />
    </Suspense>
  )
}

async function BudgetContent({ projectId }: { projectId: string }) {
  const [budgetItems, budgetSummary] = await Promise.all([
    getProjectBudgetItems(projectId),
    getProjectBudgetSummary(projectId),
  ])

  if (!budgetSummary) {
    // Create a default summary if none exists
    const defaultSummary = {
      total_budget: 0,
      total_spent: budgetItems.reduce((sum, item) => sum + (item.amount || 0), 0),
      remaining_budget: 0,
      budget_percentage_used: 0,
      categories: [],
    }

    return <BudgetOverview projectId={projectId} summary={defaultSummary} items={budgetItems} />
  }

  return <BudgetOverview projectId={projectId} summary={budgetSummary} items={budgetItems} />
}

function BudgetSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="space-y-2">
        <Skeleton className="h-10 w-full max-w-md" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-6 w-48 mb-4" />
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

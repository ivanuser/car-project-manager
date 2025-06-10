import { notFound } from "next/navigation"
import { getVehicleProject } from "@/actions/project-actions"
import { getBudgetCategories, getProjectBudget, getProjectBudgetAllocations } from "@/actions/budget-actions"
import { BudgetAllocationsForm } from "@/components/budget/budget-allocations-form"

interface BudgetAllocationsPageProps {
  params: {
    id: string
  }
}

export default async function BudgetAllocationsPage({ params }: BudgetAllocationsPageProps) {
  const projectId = params.id
  const [project, categories, budgetSettings, allocations] = await Promise.all([
    getVehicleProject(projectId),
    getBudgetCategories(),
    getProjectBudget(projectId),
    getProjectBudgetAllocations(projectId),
  ])

  if (!project) {
    notFound()
  }

  const totalBudget = budgetSettings?.total_budget || 0

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Budget Allocations</h2>
        <p className="text-muted-foreground">Distribute your budget across different categories</p>
      </div>

      <BudgetAllocationsForm
        projectId={projectId}
        categories={categories}
        totalBudget={totalBudget}
        existingAllocations={allocations}
      />
    </div>
  )
}

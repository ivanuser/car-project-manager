import { notFound } from "next/navigation"
import { getVehicleProject } from "@/actions/project-actions"
import { getBudgetCategories } from "@/actions/budget-actions"
import { BudgetItemForm } from "@/components/budget/budget-item-form"

interface NewBudgetItemPageProps {
  params: {
    id: string
  }
}

export default async function NewBudgetItemPage({ params }: NewBudgetItemPageProps) {
  const projectId = params.id
  const [project, categories] = await Promise.all([getVehicleProject(projectId), getBudgetCategories()])

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Add New Expense</h2>
        <p className="text-muted-foreground">Add a new expense to your project budget</p>
      </div>

      <BudgetItemForm projectId={projectId} categories={categories} />
    </div>
  )
}

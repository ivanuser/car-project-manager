import { notFound } from "next/navigation"
import { getVehicleProject } from "@/actions/project-actions"
import { getBudgetCategories, getProjectBudgetItems } from "@/actions/budget-actions"
import { BudgetItemForm } from "@/components/budget/budget-item-form"

interface EditBudgetItemPageProps {
  params: {
    id: string
    itemId: string
  }
}

export default async function EditBudgetItemPage({ params }: EditBudgetItemPageProps) {
  const { id: projectId, itemId } = params

  const [project, categories, budgetItems] = await Promise.all([
    getVehicleProject(projectId),
    getBudgetCategories(),
    getProjectBudgetItems(projectId),
  ])

  if (!project) {
    notFound()
  }

  const budgetItem = budgetItems.find((item) => item.id === itemId)

  if (!budgetItem) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Expense</h2>
        <p className="text-muted-foreground">Update expense details</p>
      </div>

      <BudgetItemForm projectId={projectId} categories={categories} defaultValues={budgetItem} isEditing={true} />
    </div>
  )
}

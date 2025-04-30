import { notFound } from "next/navigation"
import { getVehicleProject } from "@/actions/project-actions"
import { getProjectBudget } from "@/actions/budget-actions"
import { BudgetSettingsForm } from "@/components/budget/budget-settings-form"

interface BudgetSettingsPageProps {
  params: {
    id: string
  }
}

export default async function BudgetSettingsPage({ params }: BudgetSettingsPageProps) {
  const projectId = params.id
  const [project, budgetSettings] = await Promise.all([getVehicleProject(projectId), getProjectBudget(projectId)])

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Budget Settings</h2>
        <p className="text-muted-foreground">Configure your project budget settings</p>
      </div>

      <BudgetSettingsForm projectId={projectId} defaultValues={budgetSettings || undefined} />
    </div>
  )
}

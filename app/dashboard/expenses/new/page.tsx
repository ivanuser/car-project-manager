import { getVehicleProjects } from "@/actions/project-actions"
import { ExpenseReportForm } from "@/components/expenses/expense-report-form"

export default async function NewExpenseReportPage() {
  const projects = await getVehicleProjects()

  // Format projects for the form
  const formattedProjects = projects.map((project) => ({
    id: project.id,
    name: project.name,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Expense Report</h2>
        <p className="text-muted-foreground">Create a new expense report</p>
      </div>

      <ExpenseReportForm projects={formattedProjects} />
    </div>
  )
}

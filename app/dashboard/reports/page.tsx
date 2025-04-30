import type { Metadata } from "next"
import { getTasksForReports } from "@/actions/report-actions"
import { ReportsOverview } from "@/components/reports/reports-overview"
import { ReportsDetail } from "@/components/reports/reports-detail"
import {
  calculateProjectCompletionRates,
  calculateBuildStageCompletionRates,
  calculateTimeTrackingData,
  calculateStatusDistribution,
  calculatePriorityDistribution,
  calculateCompletionTrends,
} from "@/utils/report-utils"

export const metadata: Metadata = {
  title: "Task Reports | CAJPRO",
  description: "Task completion rates and time tracking reports",
}

export default async function ReportsPage() {
  const tasks = await getTasksForReports()

  const projectCompletionRates = calculateProjectCompletionRates(tasks)
  const buildStageCompletionRates = calculateBuildStageCompletionRates(tasks)
  const timeTrackingData = calculateTimeTrackingData(tasks)
  const statusDistribution = calculateStatusDistribution(tasks)
  const priorityDistribution = calculatePriorityDistribution(tasks)
  const completionTrends = calculateCompletionTrends(tasks)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Task Reports</h2>
        <p className="text-muted-foreground">View task completion rates and time tracking reports</p>
      </div>

      <ReportsOverview
        totalTasks={tasks.length}
        completedTasks={tasks.filter((task) => task.status === "completed").length}
        inProgressTasks={tasks.filter((task) => task.status === "in_progress").length}
        blockedTasks={tasks.filter((task) => task.status === "blocked").length}
      />

      <ReportsDetail
        projectCompletionRates={projectCompletionRates}
        buildStageCompletionRates={buildStageCompletionRates}
        timeTrackingData={timeTrackingData}
        statusDistribution={statusDistribution}
        priorityDistribution={priorityDistribution}
        completionTrends={completionTrends}
      />
    </div>
  )
}

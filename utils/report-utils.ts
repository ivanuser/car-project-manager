import type { Task } from "@/actions/project-actions"

export interface ProjectCompletionRate {
  projectId: string
  projectTitle: string
  totalTasks: number
  completedTasks: number
  completionRate: number
}

export interface BuildStageCompletionRate {
  buildStage: string
  totalTasks: number
  completedTasks: number
  completionRate: number
}

export interface TimeTrackingData {
  projectId: string
  projectTitle: string
  estimatedHours: number
  actualHours: number
  efficiency: number // < 1 means under budget, > 1 means over budget
}

export interface StatusDistribution {
  status: string
  count: number
  percentage: number
}

export interface PriorityDistribution {
  priority: string
  count: number
  percentage: number
}

export interface CompletionTrend {
  date: string
  completedTasks: number
}

// Calculate completion rate by project
export function calculateProjectCompletionRates(tasks: Task[]): ProjectCompletionRate[] {
  const projectMap = new Map<string, { title: string; total: number; completed: number }>()

  // Group tasks by project
  tasks.forEach((task) => {
    if (!projectMap.has(task.project_id)) {
      projectMap.set(task.project_id, {
        title: task.project_title || "Unknown Project",
        total: 0,
        completed: 0,
      })
    }

    const projectData = projectMap.get(task.project_id)!
    projectData.total++
    if (task.status === "completed") {
      projectData.completed++
    }
  })

  // Calculate completion rates
  return Array.from(projectMap.entries()).map(([projectId, data]) => ({
    projectId,
    projectTitle: data.title,
    totalTasks: data.total,
    completedTasks: data.completed,
    completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
  }))
}

// Calculate completion rate by build stage
export function calculateBuildStageCompletionRates(tasks: Task[]): BuildStageCompletionRate[] {
  const stageMap = new Map<string, { total: number; completed: number }>()

  // Group tasks by build stage
  tasks.forEach((task) => {
    const stage = task.build_stage || "unassigned"
    if (!stageMap.has(stage)) {
      stageMap.set(stage, { total: 0, completed: 0 })
    }

    const stageData = stageMap.get(stage)!
    stageData.total++
    if (task.status === "completed") {
      stageData.completed++
    }
  })

  // Calculate completion rates
  return Array.from(stageMap.entries()).map(([buildStage, data]) => ({
    buildStage: buildStage.charAt(0).toUpperCase() + buildStage.slice(1),
    totalTasks: data.total,
    completedTasks: data.completed,
    completionRate: data.total > 0 ? (data.completed / data.total) * 100 : 0,
  }))
}

// Calculate time tracking data
export function calculateTimeTrackingData(tasks: Task[]): TimeTrackingData[] {
  const projectMap = new Map<string, { title: string; estimatedHours: number; actualHours: number }>()

  // Group tasks by project
  tasks.forEach((task) => {
    if (!projectMap.has(task.project_id)) {
      projectMap.set(task.project_id, {
        title: task.project_title || "Unknown Project",
        estimatedHours: 0,
        actualHours: 0,
      })
    }

    const projectData = projectMap.get(task.project_id)!
    projectData.estimatedHours += task.estimated_hours || 0
    projectData.actualHours += task.actual_hours || 0
  })

  // Calculate efficiency
  return Array.from(projectMap.entries()).map(([projectId, data]) => ({
    projectId,
    projectTitle: data.title,
    estimatedHours: data.estimatedHours,
    actualHours: data.actualHours,
    efficiency: data.estimatedHours > 0 ? data.actualHours / data.estimatedHours : 0,
  }))
}

// Calculate status distribution
export function calculateStatusDistribution(tasks: Task[]): StatusDistribution[] {
  const statusMap = new Map<string, number>()
  const totalTasks = tasks.length

  // Count tasks by status
  tasks.forEach((task) => {
    const status = task.status || "unknown"
    statusMap.set(status, (statusMap.get(status) || 0) + 1)
  })

  // Calculate percentages
  return Array.from(statusMap.entries()).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
    count,
    percentage: totalTasks > 0 ? (count / totalTasks) * 100 : 0,
  }))
}

// Calculate priority distribution
export function calculatePriorityDistribution(tasks: Task[]): PriorityDistribution[] {
  const priorityMap = new Map<string, number>()
  const totalTasks = tasks.length

  // Count tasks by priority
  tasks.forEach((task) => {
    const priority = task.priority || "unassigned"
    priorityMap.set(priority, (priorityMap.get(priority) || 0) + 1)
  })

  // Calculate percentages
  return Array.from(priorityMap.entries()).map(([priority, count]) => ({
    priority: priority.charAt(0).toUpperCase() + priority.slice(1),
    count,
    percentage: totalTasks > 0 ? (count / totalTasks) * 100 : 0,
  }))
}

// Calculate completion trends over time (last 30 days)
export function calculateCompletionTrends(tasks: Task[]): CompletionTrend[] {
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)

  // Initialize data for each day
  const trends: CompletionTrend[] = []
  for (let i = 0; i < 30; i++) {
    const date = new Date(thirtyDaysAgo)
    date.setDate(date.getDate() + i)
    trends.push({
      date: date.toISOString().split("T")[0],
      completedTasks: 0,
    })
  }

  // Count completed tasks by date
  tasks.forEach((task) => {
    if (task.status === "completed" && task.completed_at) {
      const completedDate = new Date(task.completed_at).toISOString().split("T")[0]
      const trendIndex = trends.findIndex((trend) => trend.date === completedDate)
      if (trendIndex !== -1) {
        trends[trendIndex].completedTasks++
      }
    }
  })

  return trends
}

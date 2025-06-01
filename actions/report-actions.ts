"use server"

import { createServerClient } from "@/lib/supabase"
import type { Task } from "@/actions/project-actions"

export interface TaskWithProject extends Task {
  project_title?: string
}

export async function getTasksForReports(): Promise<TaskWithProject[]> {
  const supabase = await createServerClient()

  const result = await supabase
    .from("tasks")
    .select(`
      *,
      vehicle_projects:project_id (
        id,
        title
      )
    `)
    .order("created_at", { ascending: false })
    .execute()
    
  const { data, error } = result

  if (error) {
    console.error("Error fetching tasks for reports:", error)
    return []
  }

  // Transform the data to include project title
  return (data || []).map((task: any) => ({
    ...task,
    project_title: task.vehicle_projects?.title || "Unknown Project",
  }))
}

export async function getCompletedTasksByDate(startDate: string, endDate: string): Promise<TaskWithProject[]> {
  const supabase = await createServerClient()

  const result = await supabase
    .from("tasks")
    .select(`
      *,
      vehicle_projects:project_id (
        id,
        title
      )
    `)
    .eq("status", "completed")
    .gte("completed_at", startDate)
    .lte("completed_at", endDate)
    .order("completed_at", { ascending: true })
    .execute()
    
  const { data, error } = result

  if (error) {
    console.error("Error fetching completed tasks:", error)
    return []
  }

  // Transform the data to include project title
  return (data || []).map((task: any) => ({
    ...task,
    project_title: task.vehicle_projects?.title || "Unknown Project",
  }))
}

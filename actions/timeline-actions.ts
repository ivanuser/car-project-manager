"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

// Get all milestones for a project
export async function getProjectMilestones(projectId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("project_milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching milestones:", error)
    return []
  }

  return data || []
}

// Create a new milestone
export async function createMilestone(formData: FormData) {
  const supabase = createServerClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const dueDate = formData.get("dueDate") as string
  const projectId = formData.get("projectId") as string
  const color = formData.get("color") as string
  const isCritical = formData.get("isCritical") === "true"

  const { data, error } = await supabase
    .from("project_milestones")
    .insert({
      title,
      description,
      due_date: dueDate,
      project_id: projectId,
      color,
      is_critical: isCritical,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/timeline`)
  return { success: true, data }
}

// Update a milestone
export async function updateMilestone(id: string, formData: FormData) {
  const supabase = createServerClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const dueDate = formData.get("dueDate") as string
  const projectId = formData.get("projectId") as string
  const color = formData.get("color") as string
  const isCritical = formData.get("isCritical") === "true"
  const completedAt = formData.get("completedAt") as string | null

  const { data, error } = await supabase
    .from("project_milestones")
    .update({
      title,
      description,
      due_date: dueDate,
      color,
      is_critical: isCritical,
      completed_at: completedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/timeline`)
  return { success: true, data }
}

// Delete a milestone
export async function deleteMilestone(id: string, projectId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("project_milestones").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/timeline`)
  return { success: true }
}

// Get all work sessions for a project
export async function getProjectWorkSessions(projectId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("work_sessions")
    .select("*, project_tasks(id, title)")
    .eq("project_id", projectId)
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Error fetching work sessions:", error)
    return []
  }

  return data || []
}

// Get all work sessions (for calendar view)
export async function getAllWorkSessions() {
  const supabase = createServerClient()
  const isDevelopment = process.env.NODE_ENV === "development"

  // Get the current user or use development user ID
  let userId = "dev-user-id"

  if (!isDevelopment) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    userId = user.id
  }

  const { data, error } = await supabase
    .from("work_sessions")
    .select(`
      *,
      vehicle_projects(id, title, user_id)
    `)
    .order("start_time", { ascending: true })

  if (error) {
    console.error("Error fetching work sessions:", error)
    return []
  }

  // Filter sessions to only include those for the current user's projects
  const filteredData = data.filter((session) => session.vehicle_projects?.user_id === userId)

  return filteredData || []
}

// Create a new work session
export async function createWorkSession(formData: FormData) {
  const supabase = createServerClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string
  const projectId = formData.get("projectId") as string
  const taskId = (formData.get("taskId") as string) || null
  const location = (formData.get("location") as string) || null
  const notes = (formData.get("notes") as string) || null
  const status = (formData.get("status") as string) || "scheduled"

  const { data, error } = await supabase
    .from("work_sessions")
    .insert({
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      project_id: projectId,
      task_id: taskId,
      location,
      notes,
      status,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/schedule`)
  revalidatePath(`/dashboard/calendar`)
  return { success: true, data }
}

// Update a work session
export async function updateWorkSession(id: string, formData: FormData) {
  const supabase = createServerClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const startTime = formData.get("startTime") as string
  const endTime = formData.get("endTime") as string
  const projectId = formData.get("projectId") as string
  const taskId = (formData.get("taskId") as string) || null
  const location = (formData.get("location") as string) || null
  const notes = (formData.get("notes") as string) || null
  const status = (formData.get("status") as string) || "scheduled"

  const { data, error } = await supabase
    .from("work_sessions")
    .update({
      title,
      description,
      start_time: startTime,
      end_time: endTime,
      task_id: taskId,
      location,
      notes,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/schedule`)
  revalidatePath(`/dashboard/calendar`)
  return { success: true, data }
}

// Delete a work session
export async function deleteWorkSession(id: string, projectId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("work_sessions").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/schedule`)
  revalidatePath(`/dashboard/calendar`)
  return { success: true }
}

// Get all timeline items for a project
export async function getProjectTimelineItems(projectId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("timeline_items")
    .select("*")
    .eq("project_id", projectId)
    .order("start_date", { ascending: true })

  if (error) {
    console.error("Error fetching timeline items:", error)
    return []
  }

  return data || []
}

// Create a new timeline item
export async function createTimelineItem(formData: FormData) {
  const supabase = createServerClient()

  const title = formData.get("title") as string
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const projectId = formData.get("projectId") as string
  const parentId = (formData.get("parentId") as string) || null
  const progress = Number.parseInt(formData.get("progress") as string) || 0
  const type = (formData.get("type") as string) || "task"
  const dependencies = formData.get("dependencies") ? JSON.parse(formData.get("dependencies") as string) : []
  const color = (formData.get("color") as string) || null
  const isCriticalPath = formData.get("isCriticalPath") === "true"
  const taskId = (formData.get("taskId") as string) || null
  const milestoneId = (formData.get("milestoneId") as string) || null

  const { data, error } = await supabase
    .from("timeline_items")
    .insert({
      title,
      start_date: startDate,
      end_date: endDate,
      project_id: projectId,
      parent_id: parentId,
      progress,
      type,
      dependencies,
      color,
      is_critical_path: isCriticalPath,
      task_id: taskId,
      milestone_id: milestoneId,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/timeline`)
  return { success: true, data }
}

// Update a timeline item
export async function updateTimelineItem(id: string, formData: FormData) {
  const supabase = createServerClient()

  const title = formData.get("title") as string
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const projectId = formData.get("projectId") as string
  const parentId = (formData.get("parentId") as string) || null
  const progress = Number.parseInt(formData.get("progress") as string) || 0
  const type = (formData.get("type") as string) || "task"
  const dependencies = formData.get("dependencies") ? JSON.parse(formData.get("dependencies") as string) : []
  const color = (formData.get("color") as string) || null
  const isCriticalPath = formData.get("isCriticalPath") === "true"
  const taskId = (formData.get("taskId") as string) || null
  const milestoneId = (formData.get("milestoneId") as string) || null

  const { data, error } = await supabase
    .from("timeline_items")
    .update({
      title,
      start_date: startDate,
      end_date: endDate,
      parent_id: parentId,
      progress,
      type,
      dependencies,
      color,
      is_critical_path: isCriticalPath,
      task_id: taskId,
      milestone_id: milestoneId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/timeline`)
  return { success: true, data }
}

// Delete a timeline item
export async function deleteTimelineItem(id: string, projectId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("timeline_items").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/timeline`)
  return { success: true }
}

// Generate timeline items from tasks
export async function generateTimelineFromTasks(projectId: string) {
  const supabase = createServerClient()

  // Get all tasks for the project
  const { data: tasks, error: tasksError } = await supabase
    .from("project_tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true })

  if (tasksError) {
    console.error("Error fetching tasks:", tasksError)
    return { error: tasksError.message }
  }

  // Delete existing timeline items for this project
  const { error: deleteError } = await supabase.from("timeline_items").delete().eq("project_id", projectId)

  if (deleteError) {
    console.error("Error deleting existing timeline items:", deleteError)
    return { error: deleteError.message }
  }

  // Create new timeline items from tasks
  const timelineItems = tasks.map((task) => {
    // Calculate end date (if due_date exists, otherwise use created_at + 7 days)
    const startDate = task.created_at
    const endDate =
      task.due_date || new Date(new Date(task.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Calculate progress based on status
    let progress = 0
    if (task.status === "completed") {
      progress = 100
    } else if (task.status === "in_progress") {
      progress = 50
    }

    return {
      title: task.title,
      start_date: startDate,
      end_date: endDate,
      project_id: projectId,
      progress,
      type: "task",
      task_id: task.id,
      is_critical_path: task.priority === "high",
      color: task.priority === "high" ? "#ef4444" : task.priority === "medium" ? "#f59e0b" : "#22c55e",
    }
  })

  // Insert new timeline items
  if (timelineItems.length > 0) {
    const { error: insertError } = await supabase.from("timeline_items").insert(timelineItems)

    if (insertError) {
      console.error("Error inserting timeline items:", insertError)
      return { error: insertError.message }
    }
  }

  revalidatePath(`/dashboard/projects/${projectId}/timeline`)
  return { success: true }
}

"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Types
export type MaintenanceSchedule = {
  id: string
  project_id: string
  title: string
  description?: string
  interval_type: "miles" | "months" | "hours"
  interval_value: number
  last_performed_at?: string
  last_performed_value?: number
  next_due_at?: string
  next_due_value?: number
  priority: "low" | "medium" | "high" | "critical"
  status: "upcoming" | "due" | "overdue" | "completed"
  created_at: string
  updated_at: string
}

export type MaintenanceLog = {
  id: string
  schedule_id?: string
  project_id: string
  title: string
  description?: string
  performed_at: string
  performed_value?: number
  cost?: number
  notes?: string
  parts_used?: string[]
  created_at: string
  updated_at: string
}

export type MaintenanceNotification = {
  id: string
  schedule_id: string
  user_id: string
  title: string
  message: string
  status: "unread" | "read" | "dismissed"
  read_at?: string
  notification_type: "upcoming" | "due" | "overdue"
  scheduled_for: string
  created_at: string
  updated_at: string
}

// Fetch maintenance schedules for a project
export async function getMaintenanceSchedules(projectId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("maintenance_schedules")
    .select("*")
    .eq("project_id", projectId)
    .order("next_due_at", { ascending: true })

  if (error) {
    console.error("Error fetching maintenance schedules:", error)
    return []
  }

  return data as MaintenanceSchedule[]
}

// Fetch all maintenance schedules for the user
export async function getAllMaintenanceSchedules() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: projects, error: projectsError } = await supabase.from("vehicle_projects").select("id")

  if (projectsError) {
    console.error("Error fetching projects:", projectsError)
    return []
  }

  const projectIds = projects.map((project) => project.id)

  if (projectIds.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from("maintenance_schedules")
    .select("*, vehicle_projects(title)")
    .in("project_id", projectIds)
    .order("next_due_at", { ascending: true })

  if (error) {
    console.error("Error fetching all maintenance schedules:", error)
    return []
  }

  return data
}

// Create a new maintenance schedule
export async function createMaintenanceSchedule(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const projectId = formData.get("project_id") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const intervalType = formData.get("interval_type") as "miles" | "months" | "hours"
  const intervalValue = Number.parseInt(formData.get("interval_value") as string)
  const lastPerformedAt = formData.get("last_performed_at") as string
  const lastPerformedValue = Number.parseInt(formData.get("last_performed_value") as string)
  const priority = formData.get("priority") as "low" | "medium" | "high" | "critical"

  // Calculate next due date based on interval type
  const nextDueAt = new Date(lastPerformedAt)
  let nextDueValue = lastPerformedValue

  if (intervalType === "months") {
    nextDueAt.setMonth(nextDueAt.getMonth() + intervalValue)
  } else if (intervalType === "miles" || intervalType === "hours") {
    nextDueValue = lastPerformedValue + intervalValue
  }

  const { data, error } = await supabase
    .from("maintenance_schedules")
    .insert([
      {
        project_id: projectId,
        title,
        description,
        interval_type: intervalType,
        interval_value: intervalValue,
        last_performed_at: lastPerformedAt,
        last_performed_value: lastPerformedValue,
        next_due_at: nextDueAt.toISOString(),
        next_due_value: nextDueValue,
        priority,
      },
    ])
    .select()

  if (error) {
    console.error("Error creating maintenance schedule:", error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/maintenance`)
  redirect(`/dashboard/projects/${projectId}/maintenance`)
}

// Update a maintenance schedule
export async function updateMaintenanceSchedule(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const id = formData.get("id") as string
  const projectId = formData.get("project_id") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const intervalType = formData.get("interval_type") as "miles" | "months" | "hours"
  const intervalValue = Number.parseInt(formData.get("interval_value") as string)
  const lastPerformedAt = formData.get("last_performed_at") as string
  const lastPerformedValue = Number.parseInt(formData.get("last_performed_value") as string)
  const priority = formData.get("priority") as "low" | "medium" | "high" | "critical"

  // Calculate next due date based on interval type
  const nextDueAt = new Date(lastPerformedAt)
  let nextDueValue = lastPerformedValue

  if (intervalType === "months") {
    nextDueAt.setMonth(nextDueAt.getMonth() + intervalValue)
  } else if (intervalType === "miles" || intervalType === "hours") {
    nextDueValue = lastPerformedValue + intervalValue
  }

  const { data, error } = await supabase
    .from("maintenance_schedules")
    .update({
      title,
      description,
      interval_type: intervalType,
      interval_value: intervalValue,
      last_performed_at: lastPerformedAt,
      last_performed_value: lastPerformedValue,
      next_due_at: nextDueAt.toISOString(),
      next_due_value: nextDueValue,
      priority,
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("Error updating maintenance schedule:", error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/maintenance`)
  redirect(`/dashboard/projects/${projectId}/maintenance`)
}

// Delete a maintenance schedule
export async function deleteMaintenanceSchedule(id: string, projectId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from("maintenance_schedules").delete().eq("id", id)

  if (error) {
    console.error("Error deleting maintenance schedule:", error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/maintenance`)
}

// Log maintenance completion
export async function logMaintenanceCompletion(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const scheduleId = formData.get("schedule_id") as string
  const projectId = formData.get("project_id") as string
  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const performedAt = formData.get("performed_at") as string
  const performedValue = Number.parseInt(formData.get("performed_value") as string)
  const cost = Number.parseFloat(formData.get("cost") as string)
  const notes = formData.get("notes") as string
  const partsUsed = formData.getAll("parts_used") as string[]

  // Start a transaction
  const { data: log, error: logError } = await supabase
    .from("maintenance_logs")
    .insert([
      {
        schedule_id: scheduleId,
        project_id: projectId,
        title,
        description,
        performed_at: performedAt,
        performed_value: performedValue,
        cost,
        notes,
        parts_used: partsUsed,
      },
    ])
    .select()

  if (logError) {
    console.error("Error logging maintenance completion:", logError)
    return { error: logError.message }
  }

  // Get the schedule to calculate the next due date
  const { data: schedule, error: scheduleError } = await supabase
    .from("maintenance_schedules")
    .select("*")
    .eq("id", scheduleId)
    .single()

  if (scheduleError) {
    console.error("Error fetching maintenance schedule:", scheduleError)
    return { error: scheduleError.message }
  }

  // Calculate next due date based on interval type
  const nextDueAt = new Date(performedAt)
  let nextDueValue = performedValue

  if (schedule.interval_type === "months") {
    nextDueAt.setMonth(nextDueAt.getMonth() + schedule.interval_value)
  } else if (schedule.interval_type === "miles" || schedule.interval_type === "hours") {
    nextDueValue = performedValue + schedule.interval_value
  }

  // Update the schedule with the new last performed and next due dates
  const { error: updateError } = await supabase
    .from("maintenance_schedules")
    .update({
      last_performed_at: performedAt,
      last_performed_value: performedValue,
      next_due_at: nextDueAt.toISOString(),
      next_due_value: nextDueValue,
      status: "upcoming",
      notification_sent: false,
      notification_sent_at: null,
    })
    .eq("id", scheduleId)

  if (updateError) {
    console.error("Error updating maintenance schedule:", updateError)
    return { error: updateError.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/maintenance`)
  redirect(`/dashboard/projects/${projectId}/maintenance`)
}

// Get maintenance logs for a project
export async function getMaintenanceLogs(projectId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase
    .from("maintenance_logs")
    .select("*")
    .eq("project_id", projectId)
    .order("performed_at", { ascending: false })

  if (error) {
    console.error("Error fetching maintenance logs:", error)
    return []
  }

  return data as MaintenanceLog[]
}

// Get maintenance notifications for the user
export async function getMaintenanceNotifications() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: userData, error: userError } = await supabase.auth.getUser()

  if (userError) {
    console.error("Error getting user:", userError)
    return []
  }

  const userId = userData.user.id

  const { data, error } = await supabase
    .from("maintenance_notifications")
    .select("*, maintenance_schedules(title, project_id, vehicle_projects(title))")
    .eq("user_id", userId)
    .eq("status", "unread")
    .order("scheduled_for", { ascending: true })

  if (error) {
    console.error("Error fetching maintenance notifications:", error)
    return []
  }

  return data
}

// Mark notification as read
export async function markNotificationAsRead(id: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("maintenance_notifications")
    .update({
      status: "read",
      read_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error marking notification as read:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard")
}

// Dismiss notification
export async function dismissNotification(id: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("maintenance_notifications")
    .update({
      status: "dismissed",
      read_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Error dismissing notification:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard")
}

// Check for due maintenance and create notifications
export async function checkMaintenanceNotifications() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get all maintenance schedules that are due or overdue and haven't sent notifications
  const { data: schedules, error: schedulesError } = await supabase
    .from("maintenance_schedules")
    .select("*, vehicle_projects(user_id, title)")
    .or("status.eq.due,status.eq.overdue")
    .eq("notification_sent", false)

  if (schedulesError) {
    console.error("Error fetching due maintenance schedules:", schedulesError)
    return { error: schedulesError.message }
  }

  if (!schedules || schedules.length === 0) {
    return { message: "No due maintenance schedules found" }
  }

  // Create notifications for each schedule
  for (const schedule of schedules) {
    const userId = schedule.vehicle_projects.user_id
    const projectTitle = schedule.vehicle_projects.title
    const notificationType = schedule.status
    const message = `${schedule.title} for ${projectTitle} is ${notificationType}. Please schedule maintenance soon.`

    const { error: notificationError } = await supabase.from("maintenance_notifications").insert([
      {
        schedule_id: schedule.id,
        user_id: userId,
        title: `Maintenance ${notificationType}: ${schedule.title}`,
        message,
        notification_type: notificationType,
        scheduled_for: schedule.next_due_at,
      },
    ])

    if (notificationError) {
      console.error("Error creating maintenance notification:", notificationError)
      continue
    }

    // Mark the schedule as having sent a notification
    const { error: updateError } = await supabase
      .from("maintenance_schedules")
      .update({
        notification_sent: true,
        notification_sent_at: new Date().toISOString(),
      })
      .eq("id", schedule.id)

    if (updateError) {
      console.error("Error updating maintenance schedule notification status:", updateError)
    }
  }

  revalidatePath("/dashboard")
  return { message: `Created ${schedules.length} maintenance notifications` }
}

"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

// Get all tasks
export async function getAllTasks() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      vehicle_projects:project_id (
        id,
        title,
        make,
        model,
        year
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return data || []
}

// Get tasks for a specific project
export async function getProjectTasks(projectId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching project tasks:", error)
    return []
  }

  return data || []
}

// Get a single task by ID
export async function getTask(id: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      vehicle_projects:project_id (
        id,
        title,
        make,
        model,
        year
      )
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching task:", error)
    return null
  }

  return data
}

// Create a new task
export async function createTask(formData: any) {
  const supabase = createClient()

  // Format the data for insertion
  const taskData = {
    title: formData.title,
    description: formData.description,
    status: formData.status,
    priority: formData.priority,
    project_id: formData.projectId,
    build_stage: formData.buildStage,
    due_date: formData.dueDate,
    estimated_hours: formData.estimatedHours,
  }

  const { data, error } = await supabase.from("tasks").insert(taskData).select().single()

  if (error) {
    console.error("Error creating task:", error)
    throw new Error("Failed to create task")
  }

  revalidatePath("/dashboard/tasks")
  if (formData.projectId) {
    revalidatePath(`/dashboard/projects/${formData.projectId}`)
  }

  return data
}

// Update an existing task
export async function updateTask(id: string, formData: any) {
  const supabase = createClient()

  // Format the data for update
  const taskData = {
    title: formData.title,
    description: formData.description,
    status: formData.status,
    priority: formData.priority,
    project_id: formData.projectId,
    build_stage: formData.buildStage,
    due_date: formData.dueDate,
    estimated_hours: formData.estimatedHours,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase.from("tasks").update(taskData).eq("id", id).select().single()

  if (error) {
    console.error("Error updating task:", error)
    throw new Error("Failed to update task")
  }

  revalidatePath("/dashboard/tasks")
  revalidatePath(`/dashboard/tasks/${id}`)
  if (formData.projectId) {
    revalidatePath(`/dashboard/projects/${formData.projectId}`)
  }

  return data
}

// Delete a task
export async function deleteTask(id: string, projectId?: string) {
  const supabase = createClient()

  const { error } = await supabase.from("tasks").delete().eq("id", id)

  if (error) {
    console.error("Error deleting task:", error)
    throw new Error("Failed to delete task")
  }

  revalidatePath("/dashboard/tasks")
  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}`)
    redirect(`/dashboard/projects/${projectId}`)
  } else {
    redirect("/dashboard/tasks")
  }
}

// Update task status
export async function updateTaskStatus(id: string, status: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating task status:", error)
    throw new Error("Failed to update task status")
  }

  revalidatePath("/dashboard/tasks")
  revalidatePath(`/dashboard/tasks/${id}`)
  if (data.project_id) {
    revalidatePath(`/dashboard/projects/${data.project_id}`)
  }

  return data
}

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

// Get all vehicle projects
export async function getVehicleProjects() {
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
    .from("vehicle_projects")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }

  return data || []
}

// Get a single vehicle project by ID
export async function getVehicleProject(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("vehicle_projects")
    .select(`
    *,
    project_tasks(*),
    project_parts(*)
  `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching vehicle project:", error)
    return null
  }

  return data
}

// Create a new vehicle project
export async function createVehicleProject(formData: FormData) {
  const supabase = createServerClient()
  const isDevelopment = process.env.NODE_ENV === "development"

  // Get the current user or use development user ID
  let userId = "dev-user-id"

  if (!isDevelopment) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to create a project" }
    }

    userId = user.id
  }

  // Extract form data
  const title = formData.get("title") as string
  const make = formData.get("make") as string
  const model = formData.get("model") as string
  const year = Number.parseInt(formData.get("year") as string) || null
  const vin = (formData.get("vin") as string) || null
  const description = (formData.get("description") as string) || null
  const projectType = (formData.get("projectType") as string) || null
  const startDate = (formData.get("startDate") as string) || null
  const endDate = (formData.get("endDate") as string) || null
  const budget = formData.get("budget") ? Number.parseFloat(formData.get("budget") as string) : null
  const status = (formData.get("status") as string) || "planning"

  // Handle file upload if present
  let thumbnailUrl = null
  const thumbnailFile = formData.get("thumbnail") as File

  if (thumbnailFile && thumbnailFile.size > 0) {
    try {
      const fileExt = thumbnailFile.name.split(".").pop()
      const fileName = `${userId}-${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("project-thumbnails")
        .upload(fileName, thumbnailFile)

      if (uploadError) {
        console.error("Thumbnail upload error:", uploadError)
      } else if (uploadData) {
        const { data: urlData } = supabase.storage.from("project-thumbnails").getPublicUrl(fileName)

        thumbnailUrl = urlData.publicUrl
      }
    } catch (error) {
      console.error("File upload error:", error)
    }
  }

  // Insert the project
  const { data, error } = await supabase
    .from("vehicle_projects")
    .insert({
      title,
      make,
      model,
      year,
      vin,
      description,
      project_type: projectType,
      start_date: startDate,
      end_date: endDate,
      budget,
      status,
      user_id: userId,
      thumbnail_url: thumbnailUrl,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating vehicle project:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/projects")
  return { success: true, data }
}

// Update an existing vehicle project
export async function updateVehicleProject(id: string, formData: FormData) {
  const supabase = createServerClient()

  // Extract form data
  const title = formData.get("title") as string
  const make = formData.get("make") as string
  const model = formData.get("model") as string
  const year = Number.parseInt(formData.get("year") as string) || null
  const vin = (formData.get("vin") as string) || null
  const description = (formData.get("description") as string) || null
  const projectType = (formData.get("projectType") as string) || null
  const startDate = (formData.get("startDate") as string) || null
  const endDate = (formData.get("endDate") as string) || null
  const budget = formData.get("budget") ? Number.parseFloat(formData.get("budget") as string) : null
  const status = (formData.get("status") as string) || "planning"

  // Handle file upload if present
  let thumbnailUrl = null
  const thumbnailFile = formData.get("thumbnail") as File

  if (thumbnailFile && thumbnailFile.size > 0) {
    try {
      const fileExt = thumbnailFile.name.split(".").pop()
      const fileName = `${id}-${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("project-thumbnails")
        .upload(fileName, thumbnailFile)

      if (uploadError) {
        console.error("Thumbnail upload error:", uploadError)
      } else if (uploadData) {
        const { data: urlData } = supabase.storage.from("project-thumbnails").getPublicUrl(fileName)

        thumbnailUrl = urlData.publicUrl
      }
    } catch (error) {
      console.error("File upload error:", error)
    }
  }

  const updateData: any = {
    title,
    make,
    model,
    year,
    vin,
    description,
    project_type: projectType,
    start_date: startDate,
    end_date: endDate,
    budget,
    status,
    updated_at: new Date().toISOString(),
  }

  // Only update thumbnail if a new one was uploaded
  if (thumbnailUrl) {
    updateData.thumbnail_url = thumbnailUrl
  }

  const { data, error } = await supabase.from("vehicle_projects").update(updateData).eq("id", id).select()

  if (error) {
    console.error("Error updating vehicle project:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/projects")
  revalidatePath(`/dashboard/projects/${id}`)
  return { success: true, data }
}

// Delete a vehicle project
export async function deleteVehicleProject(id: string) {
  const supabase = createServerClient()

  // First, delete all tasks associated with this project
  const { error: tasksError } = await supabase.from("project_tasks").delete().eq("project_id", id)

  if (tasksError) {
    console.error("Error deleting project tasks:", tasksError)
  }

  // Then delete the project
  const { error } = await supabase.from("vehicle_projects").delete().eq("id", id)

  if (error) {
    console.error("Error deleting vehicle project:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/projects")
  return { success: true }
}

// Get all tasks
export async function getAllTasks() {
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
    .from("project_tasks")
    .select(`
      *,
      vehicle_projects(id, title)
    `)
    .order("due_date", { ascending: true })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return data || []
}

// Add these functions for tasks
export async function getProjectTasks(projectId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("project_tasks")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching tasks:", error)
    return []
  }

  return data || []
}

export async function createTask(formData: FormData) {
  const supabase = createServerClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const projectId = formData.get("projectId") as string
  const status = (formData.get("status") as string) || "todo"
  const priority = (formData.get("priority") as string) || "medium"
  const dueDate = (formData.get("dueDate") as string) || null
  const estimatedHours = formData.get("estimatedHours")
    ? Number.parseFloat(formData.get("estimatedHours") as string)
    : null
  const buildStage = (formData.get("buildStage") as string) || "planning"

  const { data, error } = await supabase
    .from("project_tasks")
    .insert({
      title,
      description,
      project_id: projectId,
      status,
      priority,
      due_date: dueDate,
      estimated_hours: estimatedHours,
      build_stage: buildStage,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/tasks")
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true, data }
}

export async function updateTask(id: string, formData: FormData) {
  const supabase = createServerClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const projectId = formData.get("projectId") as string
  const status = formData.get("status") as string
  const priority = formData.get("priority") as string
  const dueDate = (formData.get("dueDate") as string) || null
  const estimatedHours = formData.get("estimatedHours")
    ? Number.parseFloat(formData.get("estimatedHours") as string)
    : null
  const buildStage = formData.get("buildStage") as string

  const { data, error } = await supabase
    .from("project_tasks")
    .update({
      title,
      description,
      project_id: projectId,
      status,
      priority,
      due_date: dueDate,
      estimated_hours: estimatedHours,
      build_stage: buildStage,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/tasks")
  revalidatePath(`/dashboard/projects/${projectId}`)
  revalidatePath(`/dashboard/tasks/${id}`)
  return { success: true, data }
}

export async function deleteTask(id: string, projectId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("project_tasks").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/tasks")
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true }
}

export async function updateTaskStatus(id: string, status: string, projectId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("project_tasks")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard/tasks")
  revalidatePath(`/dashboard/projects/${projectId}`)
  return { success: true, data }
}

export async function getTaskById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("project_tasks")
    .select(`
      *,
      vehicle_projects(id, title)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching task:", error)
    return null
  }

  return data
}

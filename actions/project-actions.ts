"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

export async function createVehicleProject(formData: FormData) {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "You must be logged in to create a project" }
  }

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const make = formData.get("make") as string
  const model = formData.get("model") as string
  const year = Number.parseInt(formData.get("year") as string) || null

  const { data, error } = await supabase
    .from("vehicle_projects")
    .insert({
      title,
      description,
      make,
      model,
      year,
      status: "planning",
      user_id: user.id,
    })
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true, data }
}

export async function getVehicleProjects() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("vehicle_projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
    return []
  }

  return data
}

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
    console.error("Error fetching project:", error)
    return null
  }

  return data
}

export async function updateVehicleProject(id: string, formData: FormData) {
  const supabase = createServerClient()

  const title = formData.get("title") as string
  const description = formData.get("description") as string
  const make = formData.get("make") as string
  const model = formData.get("model") as string
  const year = Number.parseInt(formData.get("year") as string) || null
  const status = formData.get("status") as string

  const { data, error } = await supabase
    .from("vehicle_projects")
    .update({
      title,
      description,
      make,
      model,
      year,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${id}`)
  return { success: true, data }
}

export async function deleteVehicleProject(id: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("vehicle_projects").delete().eq("id", id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"

export type BudgetCategory = {
  id: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export type BudgetItem = {
  id: string
  project_id: string
  category_id: string | null
  category_name?: string
  title: string
  description: string | null
  amount: number
  estimated_amount: number | null
  date: string
  receipt_url: string | null
  vendor: string | null
  payment_method: string | null
  status: string
  created_at: string
  updated_at: string
}

export type ProjectBudget = {
  project_id: string
  total_budget: number | null
  alert_threshold: number
  created_at: string
  updated_at: string
}

export type BudgetAllocation = {
  id: string
  project_id: string
  category_id: string
  category_name?: string
  allocated_amount: number
  created_at: string
  updated_at: string
}

export type BudgetSummary = {
  total_budget: number
  total_spent: number
  remaining_budget: number
  budget_percentage_used: number
  categories: {
    id: string
    name: string
    allocated: number
    spent: number
    remaining: number
    percentage_used: number
  }[]
}

// Get all budget categories
export async function getBudgetCategories() {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("budget_categories").select("*").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching budget categories:", error)
    return []
  }

  return data as BudgetCategory[]
}

// Get budget items for a project
export async function getProjectBudgetItems(projectId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("budget_items")
    .select(`
      *,
      budget_categories(name)
    `)
    .eq("project_id", projectId)
    .order("date", { ascending: false })

  if (error) {
    console.error("Error fetching budget items:", error)
    return []
  }

  // Format the data to include category_name
  return data.map((item) => ({
    ...item,
    category_name: item.budget_categories?.name || null,
  })) as BudgetItem[]
}

// Get project budget settings
export async function getProjectBudget(projectId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("project_budgets").select("*").eq("project_id", projectId).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "Row not found" error
    console.error("Error fetching project budget:", error)
    return null
  }

  return (data as ProjectBudget) || null
}

// Get budget allocations for a project
export async function getProjectBudgetAllocations(projectId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("budget_allocations")
    .select(`
      *,
      budget_categories(name)
    `)
    .eq("project_id", projectId)

  if (error) {
    console.error("Error fetching budget allocations:", error)
    return []
  }

  // Format the data to include category_name
  return data.map((allocation) => ({
    ...allocation,
    category_name: allocation.budget_categories?.name || null,
  })) as BudgetAllocation[]
}

// Create a new budget item
export async function createBudgetItem(formData: FormData) {
  const supabase = createServerClient()

  const projectId = formData.get("projectId") as string
  const categoryId = (formData.get("categoryId") as string) || null
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || null
  const amount = Number.parseFloat(formData.get("amount") as string)
  const estimatedAmount = formData.get("estimatedAmount")
    ? Number.parseFloat(formData.get("estimatedAmount") as string)
    : null
  const date = formData.get("date") as string
  const vendor = (formData.get("vendor") as string) || null
  const paymentMethod = (formData.get("paymentMethod") as string) || null
  const status = (formData.get("status") as string) || "completed"

  // Handle receipt upload if present
  let receiptUrl = null
  const receiptFile = formData.get("receipt") as File

  if (receiptFile && receiptFile.size > 0) {
    try {
      const fileExt = receiptFile.name.split(".").pop()
      const fileName = `${projectId}-${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, receiptFile)

      if (uploadError) {
        console.error("Receipt upload error:", uploadError)
      } else if (uploadData) {
        const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(fileName)
        receiptUrl = urlData.publicUrl
      }
    } catch (error) {
      console.error("File upload error:", error)
    }
  }

  const { data, error } = await supabase
    .from("budget_items")
    .insert({
      project_id: projectId,
      category_id: categoryId,
      title,
      description,
      amount,
      estimated_amount: estimatedAmount,
      date,
      receipt_url: receiptUrl,
      vendor,
      payment_method: paymentMethod,
      status,
    })
    .select()

  if (error) {
    console.error("Error creating budget item:", error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/budget`)
  return { success: true, data }
}

// Update a budget item
export async function updateBudgetItem(id: string, formData: FormData) {
  const supabase = createServerClient()

  const projectId = formData.get("projectId") as string
  const categoryId = (formData.get("categoryId") as string) || null
  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || null
  const amount = Number.parseFloat(formData.get("amount") as string)
  const estimatedAmount = formData.get("estimatedAmount")
    ? Number.parseFloat(formData.get("estimatedAmount") as string)
    : null
  const date = formData.get("date") as string
  const vendor = (formData.get("vendor") as string) || null
  const paymentMethod = (formData.get("paymentMethod") as string) || null
  const status = (formData.get("status") as string) || "completed"

  // Handle receipt upload if present
  let receiptUrl = null
  const receiptFile = formData.get("receipt") as File

  if (receiptFile && receiptFile.size > 0) {
    try {
      const fileExt = receiptFile.name.split(".").pop()
      const fileName = `${projectId}-${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("receipts")
        .upload(fileName, receiptFile)

      if (uploadError) {
        console.error("Receipt upload error:", uploadError)
      } else if (uploadData) {
        const { data: urlData } = supabase.storage.from("receipts").getPublicUrl(fileName)
        receiptUrl = urlData.publicUrl
      }
    } catch (error) {
      console.error("File upload error:", error)
    }
  }

  const updateData: any = {
    category_id: categoryId,
    title,
    description,
    amount,
    estimated_amount: estimatedAmount,
    date,
    vendor,
    payment_method: paymentMethod,
    status,
    updated_at: new Date().toISOString(),
  }

  // Only update receipt_url if a new one was uploaded
  if (receiptUrl) {
    updateData.receipt_url = receiptUrl
  }

  const { data, error } = await supabase.from("budget_items").update(updateData).eq("id", id).select()

  if (error) {
    console.error("Error updating budget item:", error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/budget`)
  return { success: true, data }
}

// Delete a budget item
export async function deleteBudgetItem(id: string, projectId: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("budget_items").delete().eq("id", id)

  if (error) {
    console.error("Error deleting budget item:", error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/budget`)
  return { success: true }
}

// Update project budget settings
export async function updateProjectBudget(projectId: string, formData: FormData) {
  const supabase = createServerClient()

  const totalBudget = Number.parseFloat(formData.get("totalBudget") as string)
  const alertThreshold = Number.parseInt(formData.get("alertThreshold") as string) || 80

  // Check if project budget exists
  const { data: existingBudget } = await supabase
    .from("project_budgets")
    .select("project_id")
    .eq("project_id", projectId)
    .single()

  let result

  if (existingBudget) {
    // Update existing budget
    result = await supabase
      .from("project_budgets")
      .update({
        total_budget: totalBudget,
        alert_threshold: alertThreshold,
        updated_at: new Date().toISOString(),
      })
      .eq("project_id", projectId)
      .select()
  } else {
    // Create new budget
    result = await supabase
      .from("project_budgets")
      .insert({
        project_id: projectId,
        total_budget: totalBudget,
        alert_threshold: alertThreshold,
      })
      .select()
  }

  if (result.error) {
    console.error("Error updating project budget:", result.error)
    return { error: result.error.message }
  }

  // Also update the budget field in vehicle_projects for quick access
  await supabase.from("vehicle_projects").update({ budget: totalBudget }).eq("id", projectId)

  revalidatePath(`/dashboard/projects/${projectId}/budget`)
  return { success: true, data: result.data }
}

// Update budget allocations
export async function updateBudgetAllocations(
  projectId: string,
  allocations: { categoryId: string; amount: number }[],
) {
  const supabase = createServerClient()

  // Delete existing allocations
  await supabase.from("budget_allocations").delete().eq("project_id", projectId)

  // Insert new allocations
  const allocationsToInsert = allocations.map((allocation) => ({
    project_id: projectId,
    category_id: allocation.categoryId,
    allocated_amount: allocation.amount,
  }))

  const { data, error } = await supabase.from("budget_allocations").insert(allocationsToInsert).select()

  if (error) {
    console.error("Error updating budget allocations:", error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/projects/${projectId}/budget`)
  return { success: true, data }
}

// Get budget summary for a project
export async function getProjectBudgetSummary(projectId: string): Promise<BudgetSummary | null> {
  const supabase = createServerClient()

  // Get project budget
  const { data: budgetData, error: budgetError } = await supabase
    .from("project_budgets")
    .select("*")
    .eq("project_id", projectId)
    .single()

  if (budgetError && budgetError.code !== "PGRST116") {
    console.error("Error fetching project budget:", budgetError)
    return null
  }

  // Get budget items
  const { data: itemsData, error: itemsError } = await supabase
    .from("budget_items")
    .select(`
      *,
      budget_categories(id, name)
    `)
    .eq("project_id", projectId)

  if (itemsError) {
    console.error("Error fetching budget items:", itemsError)
    return null
  }

  // Get budget allocations
  const { data: allocationsData, error: allocationsError } = await supabase
    .from("budget_allocations")
    .select(`
      *,
      budget_categories(id, name)
    `)
    .eq("project_id", projectId)

  if (allocationsError) {
    console.error("Error fetching budget allocations:", allocationsError)
    return null
  }

  // Get all categories
  const { data: categoriesData, error: categoriesError } = await supabase.from("budget_categories").select("*")

  if (categoriesError) {
    console.error("Error fetching categories:", categoriesError)
    return null
  }

  // Calculate total spent
  const totalSpent = itemsData.reduce((sum, item) => sum + (item.amount || 0), 0)

  // Calculate total budget
  const totalBudget = budgetData?.total_budget || 0

  // Calculate remaining budget
  const remainingBudget = totalBudget - totalSpent

  // Calculate budget percentage used
  const budgetPercentageUsed = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Calculate category summaries
  const categoryMap = new Map()

  // Initialize with all categories
  categoriesData.forEach((category) => {
    categoryMap.set(category.id, {
      id: category.id,
      name: category.name,
      allocated: 0,
      spent: 0,
      remaining: 0,
      percentage_used: 0,
    })
  })

  // Add allocations
  allocationsData.forEach((allocation) => {
    const categoryId = allocation.category_id
    if (categoryMap.has(categoryId)) {
      const category = categoryMap.get(categoryId)
      category.allocated = allocation.allocated_amount || 0
      category.remaining = category.allocated - category.spent
      category.percentage_used = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0
      categoryMap.set(categoryId, category)
    }
  })

  // Add expenses
  itemsData.forEach((item) => {
    const categoryId = item.category_id
    if (categoryId && categoryMap.has(categoryId)) {
      const category = categoryMap.get(categoryId)
      category.spent += item.amount || 0
      category.remaining = category.allocated - category.spent
      category.percentage_used = category.allocated > 0 ? (category.spent / category.allocated) * 100 : 0
      categoryMap.set(categoryId, category)
    }
  })

  // Create summary object
  const summary: BudgetSummary = {
    total_budget: totalBudget,
    total_spent: totalSpent,
    remaining_budget: remainingBudget,
    budget_percentage_used: budgetPercentageUsed,
    categories: Array.from(categoryMap.values()),
  }

  return summary
}

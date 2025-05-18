"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"
import { getBudgetCategories, type BudgetItem } from "@/actions/budget-actions"
import { initializeExpenseSchema } from "@/lib/init-expense-schema"

export interface ReceiptData {
  vendor: string
  date: string
  total: number
  items?: Array<{
    description: string
    amount: number
  }>
  taxAmount?: number
}

export interface ExpenseReport {
  id: string
  title: string
  description: string | null
  start_date: string
  end_date: string
  total_amount: number
  status: string
  created_at: string
  updated_at: string
  user_id: string
  project_id: string | null
  items: BudgetItem[]
}

// Scan receipt using OCR and extract data
export async function scanReceipt(formData: FormData) {
  try {
    const receiptFile = formData.get("receipt") as File

    if (!receiptFile || !receiptFile.size) {
      return { error: "No receipt file provided" }
    }

    // In a real implementation, we would upload the file to a service like
    // Google Cloud Vision API, AWS Textract, or a specialized receipt OCR API
    // For this demo, we'll simulate the OCR process with a delay and mock data

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Mock OCR result based on file name to simulate different receipts
    // In a real implementation, this would come from the OCR service
    const fileName = receiptFile.name.toLowerCase()

    let mockData: ReceiptData

    if (fileName.includes("auto") || fileName.includes("car")) {
      mockData = {
        vendor: "AutoZone",
        date: new Date().toISOString().split("T")[0],
        total: 87.95,
        items: [
          { description: "Oil Filter", amount: 12.99 },
          { description: "Synthetic Oil 5qt", amount: 49.99 },
          { description: "Air Filter", amount: 19.99 },
        ],
        taxAmount: 4.98,
      }
    } else if (fileName.includes("hard") || fileName.includes("tool")) {
      mockData = {
        vendor: "Harbor Freight",
        date: new Date().toISOString().split("T")[0],
        total: 124.5,
        items: [
          { description: "Socket Set", amount: 59.99 },
          { description: "Impact Driver", amount: 49.99 },
          { description: "Work Gloves", amount: 7.99 },
        ],
        taxAmount: 6.53,
      }
    } else {
      // Default mock data
      mockData = {
        vendor: "Vendor Name",
        date: new Date().toISOString().split("T")[0],
        total: 49.99,
        taxAmount: 3.5,
      }
    }

    // Simulate AI categorization
    const suggestedCategory = await suggestExpenseCategory(mockData)

    return {
      success: true,
      data: {
        ...mockData,
        suggestedCategory,
      },
    }
  } catch (error) {
    console.error("Receipt scanning error:", error)
    return { error: "Failed to process receipt" }
  }
}

// Use AI to suggest a category for the expense
async function suggestExpenseCategory(receiptData: ReceiptData): Promise<string | null> {
  try {
    // Get available categories
    const categories = await getBudgetCategories()

    // In a real implementation, we would use an AI service to analyze the receipt
    // and suggest the most appropriate category based on the vendor and items

    // For this demo, we'll use simple keyword matching
    const vendor = receiptData.vendor.toLowerCase()
    const itemDescriptions = receiptData.items?.map((item) => item.description.toLowerCase()) || []

    // Auto parts stores
    if (
      vendor.includes("auto") ||
      vendor.includes("o'reilly") ||
      vendor.includes("advance") ||
      vendor.includes("napa")
    ) {
      return categories.find((c) => c.name === "Parts")?.id || null
    }

    // Tool stores
    if (
      vendor.includes("harbor") ||
      vendor.includes("tool") ||
      vendor.includes("home depot") ||
      vendor.includes("lowes")
    ) {
      return categories.find((c) => c.name === "Tools")?.id || null
    }

    // Check item descriptions for clues
    for (const desc of itemDescriptions) {
      if (desc.includes("oil") || desc.includes("filter") || desc.includes("spark")) {
        return categories.find((c) => c.name === "Parts")?.id || null
      }

      if (desc.includes("tool") || desc.includes("wrench") || desc.includes("socket")) {
        return categories.find((c) => c.name === "Tools")?.id || null
      }
    }

    // Default to miscellaneous if no match found
    return categories.find((c) => c.name === "Miscellaneous")?.id || null
  } catch (error) {
    console.error("Category suggestion error:", error)
    return null
  }
}

// Create a new expense report
export async function createExpenseReport(formData: FormData) {
  const supabase = createServerClient()

  // Ensure the expense schema is initialized
  await initializeExpenseSchema()

  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || null
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string
  const projectId = (formData.get("projectId") as string) || null

  // Get user ID from session
  const authClient = await createServerClient()
  const {
    data: { session },
  } = await authClient.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    return { error: "User not authenticated" }
  }

  // Create the report
  const { data, error } = await supabase
    .from("expense_reports")
    .insert({
      title,
      description,
      start_date: startDate,
      end_date: endDate,
      status: "draft",
      user_id: userId,
      project_id: projectId,
      total_amount: 0, // Will be updated when items are added
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating expense report:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/expenses")
  return { success: true, data }
}

// Get expense reports for the current user
export async function getUserExpenseReports() {
  const supabase = createServerClient()

  // Ensure the expense schema is initialized
  try {
    await initializeExpenseSchema()
  } catch (error) {
    console.error("Error initializing expense schema:", error)
    return []
  }

  // Get user ID from session
  const authClient = await createServerClient()
  const {
    data: { session },
  } = await authClient.auth.getSession()
  const userId = session?.user?.id

  if (!userId) {
    return []
  }

  // Check if the expense_reports table exists
  const { data: tableExists, error: checkError } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_name", "expense_reports")
    .eq("table_schema", "public")
    .limit(1)

  if (checkError || !tableExists || tableExists.length === 0) {
    console.error("Expense reports table does not exist:", checkError)
    return []
  }

  const { data, error } = await supabase
    .from("expense_reports")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching expense reports:", error)
    return []
  }

  return data as ExpenseReport[]
}

// Get a specific expense report with its items
export async function getExpenseReport(reportId: string) {
  const supabase = createServerClient()

  // Ensure the expense schema is initialized
  try {
    await initializeExpenseSchema()
  } catch (error) {
    console.error("Error initializing expense schema:", error)
    return null
  }

  // Check if the expense_reports table exists
  const { data: tableExists, error: checkError } = await supabase
    .from("information_schema.tables")
    .select("table_name")
    .eq("table_name", "expense_reports")
    .eq("table_schema", "public")
    .limit(1)

  if (checkError || !tableExists || tableExists.length === 0) {
    console.error("Expense reports table does not exist:", checkError)
    return null
  }

  // Get the report
  const { data: report, error: reportError } = await supabase
    .from("expense_reports")
    .select("*")
    .eq("id", reportId)
    .single()

  if (reportError) {
    console.error("Error fetching expense report:", reportError)
    return null
  }

  // Check if budget_items table has expense_report_id column
  const { data: columnExists, error: columnError } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_name", "budget_items")
    .eq("column_name", "expense_report_id")
    .limit(1)

  if (columnError || !columnExists || columnExists.length === 0) {
    console.error("Expense report ID column does not exist in budget_items:", columnError)
    return {
      ...report,
      items: [],
    } as ExpenseReport
  }

  // Get the report items (budget items linked to this report)
  const { data: items, error: itemsError } = await supabase
    .from("budget_items")
    .select(`
      *,
      budget_categories(name)
    `)
    .eq("expense_report_id", reportId)
    .order("date", { ascending: false })

  if (itemsError) {
    console.error("Error fetching expense report items:", itemsError)
    return {
      ...report,
      items: [],
    } as ExpenseReport
  }

  // Format the data to include category_name
  const formattedItems = items.map((item) => ({
    ...item,
    category_name: item.budget_categories?.name || null,
  }))

  return {
    ...report,
    items: formattedItems,
  } as ExpenseReport
}

// Update expense report status
export async function updateExpenseReportStatus(reportId: string, status: string) {
  const supabase = createServerClient()

  // Ensure the expense schema is initialized
  await initializeExpenseSchema()

  const { data, error } = await supabase
    .from("expense_reports")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)
    .select()

  if (error) {
    console.error("Error updating expense report status:", error)
    return { error: error.message }
  }

  revalidatePath(`/dashboard/expenses/${reportId}`)
  return { success: true, data }
}

// Add an expense item to a report
export async function addExpenseToReport(reportId: string, itemId: string) {
  const supabase = createServerClient()

  // Ensure the expense schema is initialized
  await initializeExpenseSchema()

  // Check if budget_items table has expense_report_id column
  const { data: columnExists, error: columnError } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_name", "budget_items")
    .eq("column_name", "expense_report_id")
    .limit(1)

  if (columnError || !columnExists || columnExists.length === 0) {
    console.error("Expense report ID column does not exist in budget_items:", columnError)
    return { error: "Database schema is not properly set up for expense reports" }
  }

  // Update the budget item to link it to the report
  const { data: itemData, error: itemError } = await supabase
    .from("budget_items")
    .update({
      expense_report_id: reportId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .select()

  if (itemError) {
    console.error("Error adding expense to report:", itemError)
    return { error: itemError.message }
  }

  // Update the report's total amount
  const { data: reportItems } = await supabase.from("budget_items").select("amount").eq("expense_report_id", reportId)

  const totalAmount = reportItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

  await supabase
    .from("expense_reports")
    .update({
      total_amount: totalAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)

  revalidatePath(`/dashboard/expenses/${reportId}`)
  return { success: true, data: itemData }
}

// Remove an expense item from a report
export async function removeExpenseFromReport(reportId: string, itemId: string) {
  const supabase = createServerClient()

  // Ensure the expense schema is initialized
  await initializeExpenseSchema()

  // Check if budget_items table has expense_report_id column
  const { data: columnExists, error: columnError } = await supabase
    .from("information_schema.columns")
    .select("column_name")
    .eq("table_name", "budget_items")
    .eq("column_name", "expense_report_id")
    .limit(1)

  if (columnError || !columnExists || columnExists.length === 0) {
    console.error("Expense report ID column does not exist in budget_items:", columnError)
    return { error: "Database schema is not properly set up for expense reports" }
  }

  // Update the budget item to unlink it from the report
  const { data: itemData, error: itemError } = await supabase
    .from("budget_items")
    .update({
      expense_report_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .select()

  if (itemError) {
    console.error("Error removing expense from report:", itemError)
    return { error: itemError.message }
  }

  // Update the report's total amount
  const { data: reportItems } = await supabase.from("budget_items").select("amount").eq("expense_report_id", reportId)

  const totalAmount = reportItems?.reduce((sum, item) => sum + (item.amount || 0), 0) || 0

  await supabase
    .from("expense_reports")
    .update({
      total_amount: totalAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reportId)

  revalidatePath(`/dashboard/expenses/${reportId}`)
  return { success: true, data: itemData }
}

// Get expense analytics data
export async function getExpenseAnalytics(projectId?: string, timeframe = "month") {
  const supabase = createServerClient()

  // Ensure the expense schema is initialized
  try {
    await initializeExpenseSchema()
  } catch (error) {
    console.error("Error initializing expense schema:", error)
    return null
  }

  // Define the time range based on the timeframe
  let startDate: Date
  const endDate = new Date()

  switch (timeframe) {
    case "week":
      startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)
      break
    case "month":
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
      break
    case "quarter":
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 3)
      break
    case "year":
      startDate = new Date()
      startDate.setFullYear(startDate.getFullYear() - 1)
      break
    default:
      startDate = new Date()
      startDate.setMonth(startDate.getMonth() - 1)
  }

  // Format dates for the query
  const startDateStr = startDate.toISOString().split("T")[0]
  const endDateStr = endDate.toISOString().split("T")[0]

  // Build the query
  let query = supabase
    .from("budget_items")
    .select(`
      *,
      budget_categories(id, name, color)
    `)
    .gte("date", startDateStr)
    .lte("date", endDateStr)

  // Add project filter if provided
  if (projectId) {
    query = query.eq("project_id", projectId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching expense analytics:", error)
    return null
  }

  // Process the data for analytics
  const formattedItems = data.map((item) => ({
    ...item,
    category_name: item.budget_categories?.name || "Uncategorized",
    category_color: item.budget_categories?.color || "#6b7280",
  }))

  // Calculate spending by category
  const categorySpending: Record<string, number> = {}
  const categoryColors: Record<string, string> = {}

  formattedItems.forEach((item) => {
    const categoryName = item.category_name
    if (!categorySpending[categoryName]) {
      categorySpending[categoryName] = 0
      categoryColors[categoryName] = item.category_color
    }
    categorySpending[categoryName] += item.amount || 0
  })

  // Calculate spending over time (by week or month depending on timeframe)
  const timeSeriesData: Record<string, number> = {}
  const timeFormat = timeframe === "week" || timeframe === "month" ? "week" : "month"

  formattedItems.forEach((item) => {
    const date = new Date(item.date)
    let key: string

    if (timeFormat === "week") {
      // Get the week number (Sunday-based)
      const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
      const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
      const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
      key = `Week ${weekNum}`
    } else {
      // Get month name
      key = date.toLocaleString("default", { month: "long" })
    }

    if (!timeSeriesData[key]) {
      timeSeriesData[key] = 0
    }
    timeSeriesData[key] += item.amount || 0
  })

  // Calculate top vendors
  const vendorSpending: Record<string, number> = {}

  formattedItems.forEach((item) => {
    const vendor = item.vendor || "Unknown"
    if (!vendorSpending[vendor]) {
      vendorSpending[vendor] = 0
    }
    vendorSpending[vendor] += item.amount || 0
  })

  // Sort and limit to top 5 vendors
  const topVendors = Object.entries(vendorSpending)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([vendor, amount]) => ({ vendor, amount }))

  return {
    totalSpent: formattedItems.reduce((sum, item) => sum + (item.amount || 0), 0),
    itemCount: formattedItems.length,
    categorySpending: Object.entries(categorySpending).map(([category, amount]) => ({
      category,
      amount,
      color: categoryColors[category],
    })),
    timeSeriesData: Object.entries(timeSeriesData).map(([period, amount]) => ({
      period,
      amount,
    })),
    topVendors,
    recentItems: formattedItems.slice(0, 5),
  }
}

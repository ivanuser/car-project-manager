"use server"

import { revalidatePath } from "next/cache"
import { query } from "@/lib/db"
import { getBudgetCategories, type BudgetItem } from "@/actions/budget-actions"
import { initializeExpenseSchema } from "@/lib/init-expense-schema"
import { getCurrentUserId } from "@/lib/auth-utils"
import { saveUploadedFile } from "@/lib/file-storage"

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

// Upload receipt for a budget item
export async function uploadReceiptForBudgetItem(budgetItemId: string, formData: FormData) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "Unauthorized" }
    }

    const receipt = formData.get("receipt") as File

    if (!receipt || receipt.size === 0) {
      return { error: "No receipt file provided" }
    }

    // Verify budget item ownership through project
    const budgetItemCheck = await query(
      `SELECT bi.id, bi.project_id FROM budget_items bi
       JOIN vehicle_projects vp ON bi.project_id = vp.id
       WHERE bi.id = $1 AND vp.user_id = $2`,
      [budgetItemId, userId]
    )

    if (budgetItemCheck.rows.length === 0) {
      return { error: "Budget item not found or access denied" }
    }

    // Save receipt file
    const uploadResult = await saveUploadedFile(receipt, "receipts", userId)

    if (!uploadResult.success) {
      return { error: uploadResult.error }
    }

    // Update budget item with receipt URL
    const result = await query(
      "UPDATE budget_items SET receipt_url = $1, updated_at = NOW() WHERE id = $2 RETURNING *",
      [uploadResult.url, budgetItemId]
    )

    const projectId = budgetItemCheck.rows[0].project_id
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/dashboard/expenses")

    return {
      success: true,
      data: {
        receipt_url: uploadResult.url,
        file_name: uploadResult.fileName,
        file_size: uploadResult.fileSize
      }
    }
  } catch (error) {
    console.error("Receipt upload error:", error)
    return { error: "An unexpected error occurred" }
  }
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
  try {
    // Ensure the expense schema is initialized
    await initializeExpenseSchema()

    const title = formData.get("title") as string
    const description = (formData.get("description") as string) || null
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const projectId = (formData.get("projectId") as string) || null

    // Get current user ID
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "User not authenticated" }
    }

    // Create the report
    const result = await query(
      `INSERT INTO expense_reports (title, description, start_date, end_date, status, user_id, project_id, total_amount)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [title, description, startDate, endDate, 'draft', userId, projectId, 0]
    )

    const data = result.rows[0]

    revalidatePath("/dashboard/expenses")
    return { success: true, data }
  } catch (error) {
    console.error("Error creating expense report:", error)
    return { error: error instanceof Error ? error.message : "Failed to create expense report" }
  }
}

// Get expense reports for the current user
export async function getUserExpenseReports() {
  try {
    // Ensure the expense schema is initialized
    await initializeExpenseSchema()

    // Get current user ID
    const userId = await getCurrentUserId()
    if (!userId) {
      return []
    }

    // Check if the expense_reports table exists
    const tableExistsResult = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'expense_reports'
      )`,
      []
    )

    if (!tableExistsResult.rows[0].exists) {
      console.error("Expense reports table does not exist")
      return []
    }

    const result = await query(
      `SELECT * FROM expense_reports 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    )

    return result.rows as ExpenseReport[]
  } catch (error) {
    console.error("Error fetching expense reports:", error)
    return []
  }
}

// Get a specific expense report with its items
export async function getExpenseReport(reportId: string) {
  try {
    // Ensure the expense schema is initialized
    await initializeExpenseSchema()

    // Check if the expense_reports table exists
    const tableExistsResult = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'expense_reports'
      )`,
      []
    )

    if (!tableExistsResult.rows[0].exists) {
      console.error("Expense reports table does not exist")
      return null
    }

    // Get the report
    const reportResult = await query(
      "SELECT * FROM expense_reports WHERE id = $1",
      [reportId]
    )

    if (reportResult.rows.length === 0) {
      console.error("Expense report not found")
      return null
    }

    const report = reportResult.rows[0]

    // Check if budget_items table has expense_report_id column
    const columnExistsResult = await query(
      `SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'budget_items'
        AND column_name = 'expense_report_id'
      )`,
      []
    )

    if (!columnExistsResult.rows[0].exists) {
      console.error("Expense report ID column does not exist in budget_items")
      return {
        ...report,
        items: [],
      } as ExpenseReport
    }

    // Get the report items (budget items linked to this report)
    const itemsResult = await query(
      `SELECT bi.*, bc.name as category_name
       FROM budget_items bi
       LEFT JOIN budget_categories bc ON bi.category_id = bc.id
       WHERE bi.expense_report_id = $1
       ORDER BY bi.date DESC`,
      [reportId]
    )

    const items = itemsResult.rows

    return {
      ...report,
      items,
    } as ExpenseReport
  } catch (error) {
    console.error("Error fetching expense report:", error)
    return null
  }
}

// Update expense report status
export async function updateExpenseReportStatus(reportId: string, status: string) {
  try {
    // Ensure the expense schema is initialized
    await initializeExpenseSchema()

    const result = await query(
      `UPDATE expense_reports 
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, reportId]
    )

    const data = result.rows[0]

    revalidatePath(`/dashboard/expenses/${reportId}`)
    return { success: true, data }
  } catch (error) {
    console.error("Error updating expense report status:", error)
    return { error: error instanceof Error ? error.message : "Failed to update expense report status" }
  }
}

// Add an expense item to a report
export async function addExpenseToReport(reportId: string, itemId: string) {
  try {
    // Ensure the expense schema is initialized
    await initializeExpenseSchema()

    // Check if budget_items table has expense_report_id column
    const columnExistsResult = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'budget_items'
        AND column_name = 'expense_report_id'
      );
    `)

    if (!columnExistsResult.rows[0].exists) {
      console.error("Expense report ID column does not exist in budget_items")
      return { error: "Database schema is not properly set up for expense reports" }
    }

    // Update the budget item to link it to the report
    const itemResult = await db.query(`
      UPDATE budget_items 
      SET expense_report_id = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `, [reportId, itemId])

    if (itemResult.rows.length === 0) {
      return { error: "Budget item not found" }
    }

    // Update the report's total amount
    const reportItemsResult = await db.query(`
      SELECT COALESCE(SUM(amount), 0) as total_amount
      FROM budget_items 
      WHERE expense_report_id = $1
    `, [reportId])

    const totalAmount = reportItemsResult.rows[0].total_amount

    await db.query(`
      UPDATE expense_reports 
      SET total_amount = $1, updated_at = NOW()
      WHERE id = $2
    `, [totalAmount, reportId])

    revalidatePath(`/dashboard/expenses/${reportId}`)
    return { success: true, data: itemResult.rows[0] }
  } catch (error) {
    console.error("Error adding expense to report:", error)
    return { error: error instanceof Error ? error.message : "Failed to add expense to report" }
  }
}

// Remove an expense item from a report
export async function removeExpenseFromReport(reportId: string, itemId: string) {
  try {
    // Ensure the expense schema is initialized
    await initializeExpenseSchema()

    // Check if budget_items table has expense_report_id column
    const columnExistsResult = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'budget_items'
        AND column_name = 'expense_report_id'
      );
    `)

    if (!columnExistsResult.rows[0].exists) {
      console.error("Expense report ID column does not exist in budget_items")
      return { error: "Database schema is not properly set up for expense reports" }
    }

    // Update the budget item to unlink it from the report
    const itemResult = await db.query(`
      UPDATE budget_items 
      SET expense_report_id = NULL, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `, [itemId])

    if (itemResult.rows.length === 0) {
      return { error: "Budget item not found" }
    }

    // Update the report's total amount
    const reportItemsResult = await db.query(`
      SELECT COALESCE(SUM(amount), 0) as total_amount
      FROM budget_items 
      WHERE expense_report_id = $1
    `, [reportId])

    const totalAmount = reportItemsResult.rows[0].total_amount

    await db.query(`
      UPDATE expense_reports 
      SET total_amount = $1, updated_at = NOW()
      WHERE id = $2
    `, [totalAmount, reportId])

    revalidatePath(`/dashboard/expenses/${reportId}`)
    return { success: true, data: itemResult.rows[0] }
  } catch (error) {
    console.error("Error removing expense from report:", error)
    return { error: error instanceof Error ? error.message : "Failed to remove expense from report" }
  }
}

// Get expense analytics data
export async function getExpenseAnalytics(projectId?: string, timeframe = "month") {
  try {
    // Ensure the expense schema is initialized
    await initializeExpenseSchema()

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
    let query = `
      SELECT bi.*, bc.id as category_id, bc.name as category_name, bc.color as category_color
      FROM budget_items bi
      LEFT JOIN budget_categories bc ON bi.category_id = bc.id
      WHERE bi.date >= $1 AND bi.date <= $2
    `
    const params = [startDateStr, endDateStr]

    // Add project filter if provided
    if (projectId) {
      query += ` AND bi.project_id = $3`
      params.push(projectId)
    }

    const result = await db.query(query, params)
    const data = result.rows

    // Process the data for analytics
    const formattedItems = data.map((item) => ({
      ...item,
      category_name: item.category_name || "Uncategorized",
      category_color: item.category_color || "#6b7280",
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
  } catch (error) {
    console.error("Error fetching expense analytics:", error)
    return null
  }
}

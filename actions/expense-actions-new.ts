"use server"

import { revalidatePath } from "next/cache"
import { query } from "@/lib/db"
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
  receipt_url?: string
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
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "Unauthorized" }
    }

    const receiptFile = formData.get("receipt") as File

    if (!receiptFile || !receiptFile.size) {
      return { error: "No receipt file provided" }
    }

    // Save the receipt file temporarily
    const uploadResult = await saveUploadedFile(receiptFile, "receipts", userId)

    if (!uploadResult.success) {
      return { error: uploadResult.error }
    }

    // In a real implementation, we would use OCR service like:
    // - Google Cloud Vision API
    // - AWS Textract
    // - Azure Cognitive Services
    // - Specialized receipt OCR APIs

    // For now, simulate OCR processing with mock data
    await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate processing time

    // Generate mock OCR result based on filename/content
    const fileName = receiptFile.name.toLowerCase()
    let mockData: ReceiptData

    if (fileName.includes("auto") || fileName.includes("car") || fileName.includes("parts")) {
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
        receipt_url: uploadResult.url
      }
    } else if (fileName.includes("tool") || fileName.includes("harbor") || fileName.includes("hardware")) {
      mockData = {
        vendor: "Harbor Freight Tools",
        date: new Date().toISOString().split("T")[0],
        total: 124.50,
        items: [
          { description: "Socket Set 84pc", amount: 59.99 },
          { description: "Impact Driver", amount: 49.99 },
          { description: "Work Gloves", amount: 7.99 },
        ],
        taxAmount: 6.53,
        receipt_url: uploadResult.url
      }
    } else if (fileName.includes("gas") || fileName.includes("fuel") || fileName.includes("shell") || fileName.includes("exxon")) {
      mockData = {
        vendor: "Shell Gas Station",
        date: new Date().toISOString().split("T")[0],
        total: 45.78,
        items: [
          { description: "Gasoline 12.5 gal", amount: 42.50 },
        ],
        taxAmount: 3.28,
        receipt_url: uploadResult.url
      }
    } else {
      // Default mock data
      mockData = {
        vendor: "Auto Parts Store",
        date: new Date().toISOString().split("T")[0],
        total: 49.99,
        items: [
          { description: "Auto Part", amount: 46.49 },
        ],
        taxAmount: 3.50,
        receipt_url: uploadResult.url
      }
    }

    return {
      success: true,
      data: mockData
    }
  } catch (error) {
    console.error("Receipt scanning error:", error)
    return { error: "Failed to process receipt" }
  }
}

// Get receipts for a project
export async function getProjectReceipts(projectId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return []
    }

    const result = await query(
      `SELECT bi.id, bi.title, bi.amount, bi.date, bi.vendor, bi.receipt_url, bc.name as category_name
       FROM budget_items bi
       LEFT JOIN budget_categories bc ON bi.category_id = bc.id
       JOIN vehicle_projects vp ON bi.project_id = vp.id
       WHERE bi.project_id = $1 AND vp.user_id = $2 AND bi.receipt_url IS NOT NULL
       ORDER BY bi.date DESC`,
      [projectId, userId]
    )

    return result.rows || []
  } catch (error) {
    console.error("Error fetching project receipts:", error)
    return []
  }
}

// Get all receipts for a user
export async function getUserReceipts() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return []
    }

    const result = await query(
      `SELECT bi.id, bi.title, bi.amount, bi.date, bi.vendor, bi.receipt_url, 
              bc.name as category_name, vp.title as project_title
       FROM budget_items bi
       LEFT JOIN budget_categories bc ON bi.category_id = bc.id
       JOIN vehicle_projects vp ON bi.project_id = vp.id
       WHERE vp.user_id = $1 AND bi.receipt_url IS NOT NULL
       ORDER BY bi.date DESC`,
      [userId]
    )

    return result.rows || []
  } catch (error) {
    console.error("Error fetching user receipts:", error)
    return []
  }
}

// Remove receipt from budget item
export async function removeReceiptFromBudgetItem(budgetItemId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "Unauthorized" }
    }

    // Verify budget item ownership through project
    const budgetItemCheck = await query(
      `SELECT bi.id, bi.project_id, bi.receipt_url FROM budget_items bi
       JOIN vehicle_projects vp ON bi.project_id = vp.id
       WHERE bi.id = $1 AND vp.user_id = $2`,
      [budgetItemId, userId]
    )

    if (budgetItemCheck.rows.length === 0) {
      return { error: "Budget item not found or access denied" }
    }

    // Update budget item to remove receipt URL
    await query(
      "UPDATE budget_items SET receipt_url = NULL, updated_at = NOW() WHERE id = $1",
      [budgetItemId]
    )

    const projectId = budgetItemCheck.rows[0].project_id
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/dashboard/expenses")

    return { success: true }
  } catch (error) {
    console.error("Error removing receipt:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Create expense from scanned receipt data
export async function createExpenseFromReceipt(projectId: string, receiptData: ReceiptData) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "Unauthorized" }
    }

    // Verify project ownership
    const projectCheck = await query(
      "SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2",
      [projectId, userId]
    )

    if (projectCheck.rows.length === 0) {
      return { error: "Project not found or access denied" }
    }

    // Create budget item from receipt data
    const result = await query(
      `INSERT INTO budget_items 
       (project_id, title, description, amount, date, vendor, receipt_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        projectId,
        `Receipt from ${receiptData.vendor}`,
        receiptData.items?.map(item => `${item.description}: $${item.amount}`).join(", ") || null,
        receiptData.total,
        receiptData.date,
        receiptData.vendor,
        receiptData.receipt_url || null,
        "completed"
      ]
    )

    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/dashboard/expenses")

    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error creating expense from receipt:", error)
    return { error: "An unexpected error occurred" }
  }
}

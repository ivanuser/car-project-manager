"use server"

import { revalidatePath } from "next/cache"
import db from '@/lib/db'
import { cookies } from 'next/headers'
import jwtUtils from '@/lib/auth/jwt'

/**
 * Get the current user ID from the session
 * @returns User ID or null if not authenticated
 */
async function getCurrentUserId() {
  const cookieStore = cookies()
  const authToken = cookieStore.get('cajpro_auth_token')?.value
  
  if (!authToken) {
    return null
  }
  
  // Validate token and get user ID
  try {
    const payload = jwtUtils.verifyToken(authToken)
    if (!payload) {
      return null
    }
    
    // Extract user ID from the token
    const userId = payload.sub
    return userId
  } catch (error) {
    console.error("Error getting current user ID:", error)
    return null
  }
}

/**
 * Get all vendors (vendors are shared across all users)
 * @returns Array of vendors
 */
export async function getAllVendors() {
  // Get the current user (for authentication check)
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.log("No authenticated user found, returning empty vendors array")
    return { data: [], error: null }
  }
  
  try {
    // Vendors are shared across all users, so we don't filter by user_id
    const vendorsResult = await db.query(
      `SELECT * FROM vendors ORDER BY name ASC`
    )
    
    return { data: vendorsResult.rows || [], error: null }
  } catch (error) {
    console.error("Error fetching vendors:", error)
    return { data: [], error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

/**
 * Get a single vendor by ID
 * @param id - Vendor ID
 * @returns Vendor data or null if not found
 */
export async function getVendorById(id: string) {
  // Get the current user (for authentication check)
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.log("No authenticated user found, returning null for vendor")
    return null
  }
  
  try {
    const vendorResult = await db.query(
      `SELECT * FROM vendors WHERE id = $1`,
      [id]
    )
    
    if (vendorResult.rows.length === 0) {
      return null
    }
    
    return vendorResult.rows[0]
  } catch (error) {
    console.error("Error fetching vendor:", error)
    return null
  }
}

/**
 * Create a new vendor
 * @param formData - Form data
 * @returns Result of the operation
 */
export async function createVendor(formData: FormData) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to create a vendor" }
  }
  
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const contactName = formData.get("contact_name") as string
  const contactPosition = formData.get("contact_position") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const website = formData.get("website") as string
  const address = formData.get("address") as string
  const rating = formData.get("rating") as string
  const notes = formData.get("notes") as string
  
  try {
    // Create the vendor
    const vendorResult = await db.query(
      `INSERT INTO vendors (
         name, category, contact_name, contact_position, phone, email, website, address, rating, notes
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name,
        category || null,
        contactName || null,
        contactPosition || null,
        phone || null,
        email || null,
        website || null,
        address || null,
        rating && rating !== "-1" ? parseInt(rating) : null,
        notes || null
      ]
    )
    
    revalidatePath("/dashboard/vendors")
    revalidatePath("/dashboard/parts")
    return { success: true, data: vendorResult.rows[0] }
  } catch (error) {
    console.error("Error creating vendor:", error)
    return { error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

/**
 * Update an existing vendor
 * @param id - Vendor ID
 * @param formData - Form data
 * @returns Result of the operation
 */
export async function updateVendor(id: string, formData: FormData) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to update a vendor" }
  }
  
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const contactName = formData.get("contact_name") as string
  const contactPosition = formData.get("contact_position") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const website = formData.get("website") as string
  const address = formData.get("address") as string
  const rating = formData.get("rating") as string
  const notes = formData.get("notes") as string
  
  try {
    // Update the vendor
    const vendorResult = await db.query(
      `UPDATE vendors SET
        name = $1,
        category = $2,
        contact_name = $3,
        contact_position = $4,
        phone = $5,
        email = $6,
        website = $7,
        address = $8,
        rating = $9,
        notes = $10,
        updated_at = $11
       WHERE id = $12
       RETURNING *`,
      [
        name,
        category || null,
        contactName || null,
        contactPosition || null,
        phone || null,
        email || null,
        website || null,
        address || null,
        rating && rating !== "-1" ? parseInt(rating) : null,
        notes || null,
        new Date().toISOString(),
        id
      ]
    )
    
    if (vendorResult.rows.length === 0) {
      return { error: "Vendor not found" }
    }
    
    revalidatePath(`/dashboard/vendors/${id}`)
    revalidatePath("/dashboard/vendors")
    revalidatePath("/dashboard/parts")
    return { success: true, data: vendorResult.rows[0] }
  } catch (error) {
    console.error("Error updating vendor:", error)
    return { error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

/**
 * Delete a vendor
 * @param id - Vendor ID
 * @returns Result of the operation
 */
export async function deleteVendor(id: string) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to delete a vendor" }
  }
  
  try {
    // Begin transaction
    await db.transaction(async (client) => {
      // Check if vendor has associated parts
      const partsResult = await client.query(
        `SELECT COUNT(*) as count FROM project_parts WHERE vendor_id = $1`,
        [id]
      )
      
      const partCount = parseInt(partsResult.rows[0].count)
      
      if (partCount > 0) {
        throw new Error(`This vendor has ${partCount} associated parts. Please reassign or delete those parts before deleting this vendor.`)
      }
      
      // Delete the vendor
      const deleteResult = await client.query(
        `DELETE FROM vendors WHERE id = $1 RETURNING *`,
        [id]
      )
      
      if (deleteResult.rows.length === 0) {
        throw new Error("Vendor not found")
      }
    })
    
    revalidatePath("/dashboard/vendors")
    revalidatePath("/dashboard/parts")
    return { success: true }
  } catch (error) {
    console.error("Error deleting vendor:", error)
    return { error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

/**
 * Get vendor spending analytics
 * @returns Array of vendor spending data
 */
export async function getVendorSpendingAnalytics() {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.log("No authenticated user found, returning empty analytics")
    return { data: [], error: null }
  }
  
  try {
    // Get spending by vendor for user's projects
    const analyticsResult = await db.query(
      `SELECT 
         v.id,
         v.name,
         COUNT(p.id) as part_count,
         SUM(p.price * p.quantity) as total_spent
       FROM 
         vendors v
       LEFT JOIN 
         project_parts p ON v.id = p.vendor_id
       LEFT JOIN 
         vehicle_projects vp ON p.project_id = vp.id
       WHERE 
         vp.user_id = $1 OR vp.user_id IS NULL
       GROUP BY 
         v.id, v.name
       HAVING 
         COUNT(p.id) > 0
       ORDER BY 
         total_spent DESC`,
      [userId]
    )
    
    const formattedData = analyticsResult.rows.map(row => ({
      id: row.id,
      name: row.name,
      partCount: parseInt(row.part_count),
      totalSpent: parseFloat(row.total_spent) || 0
    }))
    
    return { data: formattedData, error: null }
  } catch (error) {
    console.error("Error fetching vendor analytics:", error)
    return { data: [], error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

/**
 * Get a single vendor by ID (alias for getVendorById for compatibility)
 * @param id - Vendor ID
 * @returns Vendor data or null if not found
 */
export async function getVendor(id: string) {
  return await getVendorById(id)
}

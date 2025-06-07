"use server"

import { revalidatePath } from "next/cache"
import db from '@/lib/db'
import { cookies } from 'next/headers'
import jwtUtils from '@/lib/auth/jwt'
import { saveUploadedFile, deleteStoredFile } from '@/lib/file-storage'

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
 * Get all parts for the current user
 * @returns Array of parts with project information
 */
export async function getAllParts() {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.log("No authenticated user found, returning empty parts array")
    return { data: [], error: null }
  }
  
  console.log("Fetching parts for user ID:", userId)
  
  try {
    // Get all projects for this user first
    const projectsResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE user_id = $1`,
      [userId]
    )
    
    if (projectsResult.rows.length === 0) {
      return { data: [], error: null }
    }
    
    const projectIds = projectsResult.rows.map(project => project.id)
    
    // Get all parts for these projects with project and vendor information
    const partsResult = await db.query(
      `SELECT 
         p.*,
         vp.id as project_id,
         vp.title as project_title,
         vp.make as project_make,
         vp.model as project_model,
         vp.year as project_year,
         v.id as vendor_id,
         v.name as vendor_name,
         v.website as vendor_website
       FROM 
         project_parts p
       JOIN 
         vehicle_projects vp ON p.project_id = vp.id
       LEFT JOIN 
         vendors v ON p.vendor_id = v.id
       WHERE 
         p.project_id = ANY($1)
       ORDER BY 
         p.created_at DESC`,
      [projectIds]
    )
    
    // Format the results to include vehicle_projects and vendors data
    const formattedParts = partsResult.rows.map(part => ({
      ...part,
      vehicle_projects: {
        id: part.project_id,
        title: part.project_title,
        make: part.project_make,
        model: part.project_model,
        year: part.project_year
      },
      vendors: part.vendor_id ? {
        id: part.vendor_id,
        name: part.vendor_name,
        website: part.vendor_website
      } : null
    }))
    
    return { data: formattedParts, error: null }
  } catch (error) {
    console.error("Error fetching parts:", error)
    return { data: [], error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

/**
 * Get parts for a specific project
 * @param projectId - Project ID
 * @returns Array of parts
 */
export async function getProjectParts(projectId: string) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.log("No authenticated user found, returning empty project parts array")
    return []
  }
  
  try {
    // Verify project belongs to the user
    const checkResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    )
    
    if (checkResult.rows.length === 0) {
      return []
    }
    
    // Get parts for this project
    const partsResult = await db.query(
      `SELECT * 
       FROM project_parts 
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [projectId]
    )
    
    return partsResult.rows || []
  } catch (error) {
    console.error("Error fetching project parts:", error)
    return []
  }
}

/**
 * Get a single part by ID
 * @param id - Part ID
 * @returns Part data or null if not found
 */
export async function getPartById(id: string) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.log("No authenticated user found, returning null for part")
    return null
  }
  
  try {
    // Get the part and verify it belongs to a project owned by the user
    const partResult = await db.query(
      `SELECT 
         p.*,
         vp.id as project_id,
         vp.title as project_title,
         vp.make as project_make,
         vp.model as project_model,
         vp.year as project_year,
         v.id as vendor_id,
         v.name as vendor_name,
         v.website as vendor_website
       FROM 
         project_parts p
       JOIN 
         vehicle_projects vp ON p.project_id = vp.id
       LEFT JOIN 
         vendors v ON p.vendor_id = v.id
       WHERE 
         p.id = $1 AND vp.user_id = $2`,
      [id, userId]
    )
    
    if (partResult.rows.length === 0) {
      return null
    }
    
    const part = partResult.rows[0]
    
    // Format the result to include vehicle_projects and vendors data
    return {
      ...part,
      vehicle_projects: {
        id: part.project_id,
        title: part.project_title,
        make: part.project_make,
        model: part.project_model,
        year: part.project_year
      },
      vendors: part.vendor_id ? {
        id: part.vendor_id,
        name: part.vendor_name,
        website: part.vendor_website
      } : null
    }
  } catch (error) {
    console.error("Error fetching part:", error)
    return null
  }
}

/**
 * Create a new part
 * @param formData - Form data
 * @returns Result of the operation
 */
export async function createPart(formData: FormData) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to create a part" }
  }
  
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const partNumber = formData.get("partNumber") as string
  const price = formData.get("price") ? Number.parseFloat(formData.get("price") as string) : null
  const quantity = Number.parseInt(formData.get("quantity") as string) || 1
  const status = (formData.get("status") as string) || "needed"
  const condition = (formData.get("condition") as string) || null
  const location = (formData.get("location") as string) || null
  const vendorId = (formData.get("vendorId") as string) || null
  const notes = (formData.get("notes") as string) || null
  const projectId = formData.get("projectId") as string
  const purchaseDate = (formData.get("purchaseDate") as string) || null
  const purchaseUrl = (formData.get("purchaseUrl") as string) || null
  
  // Handle image upload
  let imageUrl = null
  const imageFile = formData.get("image") as File
  
  if (imageFile && imageFile.size > 0) {
    console.log("Processing image upload for part, user:", userId)
    const uploadResult = await saveUploadedFile(imageFile, 'parts', userId)
    
    if (uploadResult.success) {
      imageUrl = uploadResult.url
      console.log("Part image uploaded successfully:", imageUrl)
    } else {
      console.error("Part image upload failed:", uploadResult.error)
      return { error: `Failed to upload image: ${uploadResult.error}` }
    }
  }
  
  try {
    // Verify project belongs to the user
    const checkResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    )
    
    if (checkResult.rows.length === 0) {
      return { error: "Project not found or you don't have permission to add parts to it" }
    }
    
    // Create the part
    const partResult = await db.query(
      `INSERT INTO project_parts (
         name, description, part_number, price, quantity, status,
         condition, location, vendor_id, notes,
         project_id, purchase_date, purchase_url, image_url
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
       RETURNING *`,
      [
        name, description, partNumber, price, quantity, status,
        condition, location, vendorId, notes,
        projectId, purchaseDate, purchaseUrl, imageUrl
      ]
    )
    
    revalidatePath("/dashboard/parts")
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true, data: partResult.rows[0] }
  } catch (error) {
    console.error("Error creating part:", error)
    return { error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

/**
 * Update an existing part
 * @param id - Part ID
 * @param formData - Form data
 * @returns Result of the operation
 */
export async function updatePart(id: string, formData: FormData) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to update a part" }
  }
  
  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const partNumber = formData.get("partNumber") as string
  const price = formData.get("price") ? Number.parseFloat(formData.get("price") as string) : null
  const quantity = Number.parseInt(formData.get("quantity") as string) || 1
  const status = formData.get("status") as string
  const condition = (formData.get("condition") as string) || null
  const location = (formData.get("location") as string) || null
  const vendorId = (formData.get("vendorId") as string) || null
  const notes = (formData.get("notes") as string) || null
  const projectId = formData.get("projectId") as string
  const purchaseDate = (formData.get("purchaseDate") as string) || null
  const purchaseUrl = (formData.get("purchaseUrl") as string) || null
  
  // Handle image upload for updates
  let imageUrl = null
  const imageFile = formData.get("image") as File
  
  if (imageFile && imageFile.size > 0) {
    console.log("Processing image upload for part update, user:", userId)
    const uploadResult = await saveUploadedFile(imageFile, 'parts', userId)
    
    if (uploadResult.success) {
      imageUrl = uploadResult.url
      console.log("Part image uploaded successfully:", imageUrl)
      
      // If there was an old image, we should delete it
      // First get the current part to find the old image
      const currentPart = await db.query(
        `SELECT image_url FROM project_parts WHERE id = $1`,
        [id]
      )
      
      if (currentPart.rows.length > 0 && currentPart.rows[0].image_url) {
        const oldUrl = currentPart.rows[0].image_url
        // Extract file path from URL to delete old file
        if (oldUrl.includes('/api/storage/')) {
          const pathPart = oldUrl.split('/api/storage/')[1]
          if (pathPart) {
            await deleteStoredFile(pathPart)
            console.log("Deleted old part image:", pathPart)
          }
        }
      }
    } else {
      console.error("Part image upload failed:", uploadResult.error)
      return { error: `Failed to upload image: ${uploadResult.error}` }
    }
  }
  
  try {
    // Verify project belongs to the user
    const checkResult = await db.query(
      `SELECT vp.id
       FROM vehicle_projects vp
       JOIN project_parts p ON vp.id = p.project_id
       WHERE p.id = $1 AND vp.user_id = $2`,
      [id, userId]
    )
    
    if (checkResult.rows.length === 0) {
      return { error: "Part not found or you don't have permission to update it" }
    }
    
    // Update the part
    const updateData: any = [
      name, description, partNumber, price, quantity, status,
      condition, location, vendorId, notes,
      projectId, purchaseDate, purchaseUrl, new Date().toISOString(), id
    ]
    
    let query = `
      UPDATE project_parts SET
        name = $1,
        description = $2,
        part_number = $3,
        price = $4,
        quantity = $5,
        status = $6,
        condition = $7,
        location = $8,
        vendor_id = $9,
        notes = $10,
        project_id = $11,
        purchase_date = $12,
        purchase_url = $13,
        updated_at = $14
    `
    
    // Only update image if a new one was uploaded
    if (imageUrl) {
      query += `, image_url = $16`
      updateData.push(imageUrl)
    }
    
    query += ` WHERE id = $15 RETURNING *`
    
    const partResult = await db.query(query, updateData)
    
    revalidatePath("/dashboard/parts")
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath(`/dashboard/parts/${id}`)
    return { success: true, data: partResult.rows[0] }
  } catch (error) {
    console.error("Error updating part:", error)
    return { error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

/**
 * Delete a part
 * @param id - Part ID
 * @returns Result of the operation
 */
export async function deletePart(id: string) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to delete a part" }
  }
  
  try {
    // Begin transaction
    await db.transaction(async (client) => {
      // Verify part belongs to the user and get image info
      const checkResult = await client.query(
        `SELECT p.id, p.project_id, p.image_url
         FROM project_parts p
         JOIN vehicle_projects vp ON p.project_id = vp.id
         WHERE p.id = $1 AND vp.user_id = $2`,
        [id, userId]
      )
      
      if (checkResult.rows.length === 0) {
        throw new Error("Part not found or you don't have permission to delete it")
      }
      
      const part = checkResult.rows[0]
      
      // Delete image file if it exists
      if (part.image_url && part.image_url.includes('/api/storage/')) {
        const pathPart = part.image_url.split('/api/storage/')[1]
        if (pathPart) {
          await deleteStoredFile(pathPart)
          console.log("Deleted part image:", pathPart)
        }
      }
      
      // Delete the part
      await client.query(
        `DELETE FROM project_parts WHERE id = $1`,
        [id]
      )
    })
    
    revalidatePath("/dashboard/parts")
    return { success: true }
  } catch (error) {
    console.error("Error deleting part:", error)
    return { error: error instanceof Error ? error.message : "An unexpected error occurred" }
  }
}

/**
 * Get a single part by ID (alias for getPartById for compatibility)
 * @param id - Part ID
 * @returns Part data or null if not found
 */
export async function getPart(id: string) {
  return await getPartById(id)
}

/**
 * Get all vendors for the current user
 * @returns Array of vendors
 */
export async function getVendors() {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.log("No authenticated user found, returning empty vendors array")
    return []
  }
  
  try {
    // Get all vendors for this user
    const vendorsResult = await db.query(
      `SELECT * 
       FROM vendors 
       WHERE user_id = $1
       ORDER BY name ASC`,
      [userId]
    )
    
    return vendorsResult.rows || []
  } catch (error) {
    console.error("Error fetching vendors:", error)
    return []
  }
}

/**
 * Get parts by vendor ID
 * @param vendorId - Vendor ID
 * @returns Array of parts from this vendor
 */
export async function getPartsByVendorId(vendorId: string) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.log("No authenticated user found, returning empty parts array")
    return []
  }
  
  try {
    // Get all parts from this vendor for projects owned by the user
    const partsResult = await db.query(
      `SELECT 
         p.*,
         vp.id as project_id,
         vp.title as project_title,
         vp.make as project_make,
         vp.model as project_model,
         vp.year as project_year
       FROM 
         project_parts p
       JOIN 
         vehicle_projects vp ON p.project_id = vp.id
       WHERE 
         p.vendor_id = $1 AND vp.user_id = $2
       ORDER BY 
         p.created_at DESC`,
      [vendorId, userId]
    )
    
    // Format the results to include vehicle_projects data
    const formattedParts = partsResult.rows.map(part => ({
      ...part,
      vehicle_projects: {
        id: part.project_id,
        title: part.project_title,
        make: part.project_make,
        model: part.project_model,
        year: part.project_year
      }
    }))
    
    return formattedParts
  } catch (error) {
    console.error("Error fetching parts by vendor:", error)
    return []
  }
}

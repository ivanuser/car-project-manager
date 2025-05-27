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
    console.log("No auth token found in cookies")
    return null
  }
  
  // Validate token and get user ID
  try {
    const payload = jwtUtils.verifyToken(authToken)
    if (!payload) {
      console.log("Invalid auth token")
      return null
    }
    
    // Extract user ID from the token
    return payload.sub
  } catch (error) {
    console.error("Error getting current user ID:", error)
    return null
  }
}

/**
 * Get all vehicle projects for the current user
 * @returns Array of vehicle projects
 */
export async function getVehicleProjects() {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.log("No authenticated user found, returning empty projects array")
    return []
  }
  
  console.log("Fetching projects for user ID:", userId)
  
  try {
    const result = await db.query(
      `SELECT * 
       FROM vehicle_projects 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    )
    
    return result.rows || []
  } catch (error) {
    console.error("Error fetching projects:", error)
    return []
  }
}

/**
 * Get a single vehicle project by ID
 * @param id - Project ID
 * @returns Project data or null if not found
 */
export async function getVehicleProject(id: string) {
  try {
    // Get the current user
    const userId = await getCurrentUserId()
    
    if (!userId) {
      console.log("No authenticated user found, returning null")
      return null
    }
    
    // Get project
    const projectResult = await db.query(
      `SELECT * 
       FROM vehicle_projects 
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    )
    
    if (projectResult.rows.length === 0) {
      return null
    }
    
    const project = projectResult.rows[0]
    
    // Get tasks
    const tasksResult = await db.query(
      `SELECT * 
       FROM project_tasks 
       WHERE project_id = $1`,
      [id]
    )
    
    // Get parts
    const partsResult = await db.query(
      `SELECT * 
       FROM project_parts 
       WHERE project_id = $1`,
      [id]
    )
    
    // Combine data
    return {
      ...project,
      project_tasks: tasksResult.rows || [],
      project_parts: partsResult.rows || []
    }
  } catch (error) {
    console.error("Error fetching vehicle project:", error)
    return null
  }
}

/**
 * Create a new vehicle project
 * @param formData - Form data
 * @returns Result of the operation
 */
export async function createVehicleProject(formData: FormData) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to create a project" }
  }
  
  console.log("Creating project for user ID:", userId)
  
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
  
  // Handle thumbnail upload
  let thumbnailUrl = null
  const thumbnailFile = formData.get("thumbnail") as File
  
  if (thumbnailFile && thumbnailFile.size > 0) {
    console.log("Processing thumbnail upload for user:", userId)
    const uploadResult = await saveUploadedFile(thumbnailFile, 'thumbnails', userId)
    
    if (uploadResult.success) {
      thumbnailUrl = uploadResult.url
      console.log("Thumbnail uploaded successfully:", thumbnailUrl)
    } else {
      console.error("Thumbnail upload failed:", uploadResult.error)
      return { error: `Failed to upload thumbnail: ${uploadResult.error}` }
    }
  }
  
  try {
    // Insert the project
    const result = await db.query(
      `INSERT INTO vehicle_projects (
        title, make, model, year, vin, description, project_type, 
        start_date, end_date, budget, status, user_id, thumbnail_url
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *`,
      [
        title, make, model, year, vin, description, projectType,
        startDate, endDate, budget, status, userId, thumbnailUrl
      ]
    )
    
    revalidatePath("/dashboard/projects")
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error creating vehicle project:", error)
    return { error: (error as Error).message }
  }
}

/**
 * Update an existing vehicle project
 * @param id - Project ID
 * @param formData - Form data
 * @returns Result of the operation
 */
export async function updateVehicleProject(id: string, formData: FormData) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to update a project" }
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
  
  // Handle thumbnail upload for updates
  let thumbnailUrl = null
  const thumbnailFile = formData.get("thumbnail") as File
  
  if (thumbnailFile && thumbnailFile.size > 0) {
    console.log("Processing thumbnail upload for project update, user:", userId)
    const uploadResult = await saveUploadedFile(thumbnailFile, 'thumbnails', userId)
    
    if (uploadResult.success) {
      thumbnailUrl = uploadResult.url
      console.log("Thumbnail uploaded successfully:", thumbnailUrl)
      
      // If there was an old thumbnail, we should delete it
      // First get the current project to find the old thumbnail
      const currentProject = await db.query(
        `SELECT thumbnail_url FROM vehicle_projects WHERE id = $1`,
        [id]
      )
      
      if (currentProject.rows.length > 0 && currentProject.rows[0].thumbnail_url) {
        const oldUrl = currentProject.rows[0].thumbnail_url
        // Extract file path from URL to delete old file
        if (oldUrl.includes('/api/storage/')) {
          const pathPart = oldUrl.split('/api/storage/')[1]
          if (pathPart) {
            await deleteStoredFile(pathPart)
            console.log("Deleted old thumbnail:", pathPart)
          }
        }
      }
    } else {
      console.error("Thumbnail upload failed:", uploadResult.error)
      return { error: `Failed to upload thumbnail: ${uploadResult.error}` }
    }
  }
  
  try {
    // Verify project belongs to the user
    const checkResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2`,
      [id, userId]
    )
    
    if (checkResult.rows.length === 0) {
      return { error: "Project not found or you don't have permission to update it" }
    }
    
    // Update the project
    const updateData: any = [
      title, make, model, year, vin, description, projectType,
      startDate, endDate, budget, status, new Date().toISOString(), id
    ]
    
    let query = `
      UPDATE vehicle_projects SET
        title = $1,
        make = $2,
        model = $3,
        year = $4,
        vin = $5,
        description = $6,
        project_type = $7,
        start_date = $8,
        end_date = $9,
        budget = $10,
        status = $11,
        updated_at = $12
    `
    
    // Only update thumbnail if a new one was uploaded
    if (thumbnailUrl) {
      query += `, thumbnail_url = $14`
      updateData.push(thumbnailUrl)
    }
    
    query += ` WHERE id = $13 RETURNING *`
    
    const result = await db.query(query, updateData)
    
    revalidatePath("/dashboard/projects")
    revalidatePath(`/dashboard/projects/${id}`)
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error updating vehicle project:", error)
    return { error: (error as Error).message }
  }
}

/**
 * Delete a vehicle project
 * @param id - Project ID
 * @returns Result of the operation
 */
export async function deleteVehicleProject(id: string) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to delete a project" }
  }
  
  try {
    // Begin transaction
    await db.transaction(async (client) => {
      // Verify project belongs to the user and get thumbnail info
      const checkResult = await client.query(
        `SELECT id, thumbnail_url FROM vehicle_projects WHERE id = $1 AND user_id = $2`,
        [id, userId]
      )
      
      if (checkResult.rows.length === 0) {
        throw new Error("Project not found or you don't have permission to delete it")
      }
      
      const project = checkResult.rows[0]
      
      // Delete thumbnail file if it exists
      if (project.thumbnail_url && project.thumbnail_url.includes('/api/storage/')) {
        const pathPart = project.thumbnail_url.split('/api/storage/')[1]
        if (pathPart) {
          await deleteStoredFile(pathPart)
          console.log("Deleted project thumbnail:", pathPart)
        }
      }
      
      // Delete tasks associated with this project
      await client.query(
        `DELETE FROM project_tasks WHERE project_id = $1`,
        [id]
      )
      
      // Delete parts associated with this project
      await client.query(
        `DELETE FROM project_parts WHERE project_id = $1`,
        [id]
      )
      
      // Delete the project
      await client.query(
        `DELETE FROM vehicle_projects WHERE id = $1`,
        [id]
      )
    })
    
    revalidatePath("/dashboard/projects")
    return { success: true }
  } catch (error) {
    console.error("Error deleting vehicle project:", error)
    return { error: (error as Error).message }
  }
}

/**
 * Get all tasks for the current user
 * @returns Array of tasks
 */
export async function getAllTasks() {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.log("No authenticated user found, returning empty tasks array")
    return []
  }
  
  console.log("Fetching tasks for user ID:", userId)
  
  try {
    // Get all projects for this user
    const projectsResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE user_id = $1`,
      [userId]
    )
    
    if (projectsResult.rows.length === 0) {
      return []
    }
    
    const projectIds = projectsResult.rows.map(project => project.id)
    
    // Get all tasks for these projects
    const tasksResult = await db.query(
      `SELECT 
         t.*,
         p.id as project_id,
         p.title as project_title
       FROM 
         project_tasks t
       JOIN 
         vehicle_projects p ON t.project_id = p.id
       WHERE 
         t.project_id = ANY($1)
       ORDER BY 
         t.due_date ASC NULLS LAST`,
      [projectIds]
    )
    
    // Format the results to match the expected structure
    return tasksResult.rows.map(task => ({
      ...task,
      vehicle_projects: {
        id: task.project_id,
        title: task.project_title
      }
    }))
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return []
  }
}

/**
 * Get tasks for a specific project
 * @param projectId - Project ID
 * @returns Array of tasks
 */
export async function getProjectTasks(projectId: string) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.log("No authenticated user found, returning empty project tasks array")
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
    
    // Get tasks for this project
    const tasksResult = await db.query(
      `SELECT * 
       FROM project_tasks 
       WHERE project_id = $1
       ORDER BY created_at DESC`,
      [projectId]
    )
    
    return tasksResult.rows || []
  } catch (error) {
    console.error("Error fetching project tasks:", error)
    return []
  }
}

/**
 * Create a new task
 * @param formData - Form data
 * @returns Result of the operation
 */
export async function createTask(formData: FormData) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to create a task" }
  }
  
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
  
  try {
    // Verify project belongs to the user
    const checkResult = await db.query(
      `SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2`,
      [projectId, userId]
    )
    
    if (checkResult.rows.length === 0) {
      return { error: "Project not found or you don't have permission to add tasks to it" }
    }
    
    // Create the task
    const taskResult = await db.query(
      `INSERT INTO project_tasks (
         title, description, project_id, status, priority,
         due_date, estimated_hours, build_stage
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        title, description, projectId, status, priority,
        dueDate, estimatedHours, buildStage
      ]
    )
    
    revalidatePath("/dashboard/tasks")
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true, data: taskResult.rows[0] }
  } catch (error) {
    console.error("Error creating task:", error)
    return { error: (error as Error).message }
  }
}

/**
 * Update an existing task
 * @param id - Task ID
 * @param formData - Form data
 * @returns Result of the operation
 */
export async function updateTask(id: string, formData: FormData) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to update a task" }
  }
  
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
  
  try {
    // Verify project belongs to the user
    const checkResult = await db.query(
      `SELECT v.id
       FROM vehicle_projects v
       JOIN project_tasks t ON v.id = t.project_id
       WHERE t.id = $1 AND v.user_id = $2`,
      [id, userId]
    )
    
    if (checkResult.rows.length === 0) {
      return { error: "Task not found or you don't have permission to update it" }
    }
    
    // Update the task
    const taskResult = await db.query(
      `UPDATE project_tasks SET
         title = $1,
         description = $2,
         project_id = $3,
         status = $4,
         priority = $5,
         due_date = $6,
         estimated_hours = $7,
         build_stage = $8,
         updated_at = $9
       WHERE id = $10
       RETURNING *`,
      [
        title, description, projectId, status, priority,
        dueDate, estimatedHours, buildStage, new Date().toISOString(), id
      ]
    )
    
    revalidatePath("/dashboard/tasks")
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath(`/dashboard/tasks/${id}`)
    return { success: true, data: taskResult.rows[0] }
  } catch (error) {
    console.error("Error updating task:", error)
    return { error: (error as Error).message }
  }
}

/**
 * Delete a task
 * @param id - Task ID
 * @param projectId - Project ID
 * @returns Result of the operation
 */
export async function deleteTask(id: string, projectId: string) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to delete a task" }
  }
  
  try {
    // Verify project belongs to the user
    const checkResult = await db.query(
      `SELECT v.id
       FROM vehicle_projects v
       JOIN project_tasks t ON v.id = t.project_id
       WHERE t.id = $1 AND v.user_id = $2`,
      [id, userId]
    )
    
    if (checkResult.rows.length === 0) {
      return { error: "Task not found or you don't have permission to delete it" }
    }
    
    // Delete the task
    await db.query(
      `DELETE FROM project_tasks WHERE id = $1`,
      [id]
    )
    
    revalidatePath("/dashboard/tasks")
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting task:", error)
    return { error: (error as Error).message }
  }
}

/**
 * Update a task's status
 * @param id - Task ID
 * @param status - New status
 * @param projectId - Project ID
 * @returns Result of the operation
 */
export async function updateTaskStatus(id: string, status: string, projectId: string) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    return { error: "You must be logged in to update a task status" }
  }
  
  try {
    // Verify project belongs to the user
    const checkResult = await db.query(
      `SELECT v.id
       FROM vehicle_projects v
       JOIN project_tasks t ON v.id = t.project_id
       WHERE t.id = $1 AND v.user_id = $2`,
      [id, userId]
    )
    
    if (checkResult.rows.length === 0) {
      return { error: "Task not found or you don't have permission to update it" }
    }
    
    // Update the task status
    const taskResult = await db.query(
      `UPDATE project_tasks SET
         status = $1,
         updated_at = $2
       WHERE id = $3
       RETURNING *`,
      [status, new Date().toISOString(), id]
    )
    
    revalidatePath("/dashboard/tasks")
    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true, data: taskResult.rows[0] }
  } catch (error) {
    console.error("Error updating task status:", error)
    return { error: (error as Error).message }
  }
}

/**
 * Get a task by ID
 * @param id - Task ID
 * @returns Task data or null if not found
 */
export async function getTaskById(id: string) {
  // Get the current user
  const userId = await getCurrentUserId()
  
  if (!userId) {
    console.log("No authenticated user found, returning null for task")
    return null
  }
  
  try {
    // Get the task and verify it belongs to a project owned by the user
    const taskResult = await db.query(
      `SELECT 
         t.*,
         p.id as project_id,
         p.title as project_title
       FROM 
         project_tasks t
       JOIN 
         vehicle_projects p ON t.project_id = p.id
       WHERE 
         t.id = $1 AND p.user_id = $2`,
      [id, userId]
    )
    
    if (taskResult.rows.length === 0) {
      return null
    }
    
    const task = taskResult.rows[0]
    
    // Format the result to match the expected structure
    return {
      ...task,
      vehicle_projects: {
        id: task.project_id,
        title: task.project_title
      }
    }
  } catch (error) {
    console.error("Error fetching task:", error)
    return null
  }
}

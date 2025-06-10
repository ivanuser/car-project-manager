"use server"

import { revalidatePath } from "next/cache"
import { query } from "@/lib/db"
import { saveUploadedFile, deleteStoredFile } from "@/lib/file-storage"
import { getCurrentUserId } from "@/lib/auth-utils"

// Get all photos for a project
export async function getProjectPhotos(projectId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return []
    }

    const result = await query(
      `SELECT pp.*, 
       COALESCE(
         json_agg(
           json_build_object('id', pt.id, 'name', pt.name)
         ) FILTER (WHERE pt.id IS NOT NULL), 
         '[]'
       ) as tags
       FROM project_photos pp
       LEFT JOIN photo_tag_relations ptr ON pp.id = ptr.photo_id
       LEFT JOIN photo_tags pt ON ptr.tag_id = pt.id
       WHERE pp.project_id = $1
       AND EXISTS (
         SELECT 1 FROM vehicle_projects vp 
         WHERE vp.id = pp.project_id AND vp.user_id = $2
       )
       GROUP BY pp.id
       ORDER BY pp.created_at DESC`,
      [projectId, userId]
    )

    return result.rows || []
  } catch (error) {
    console.error("Error fetching project photos:", error)
    return []
  }
}

// Get a single photo by ID
export async function getPhoto(id: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "Unauthorized" }
    }

    const result = await query(
      `SELECT pp.*, 
       COALESCE(
         json_agg(
           json_build_object('id', pt.id, 'name', pt.name)
         ) FILTER (WHERE pt.id IS NOT NULL), 
         '[]'
       ) as tags
       FROM project_photos pp
       LEFT JOIN photo_tag_relations ptr ON pp.id = ptr.photo_id
       LEFT JOIN photo_tags pt ON ptr.tag_id = pt.id
       WHERE pp.id = $1
       AND EXISTS (
         SELECT 1 FROM vehicle_projects vp 
         WHERE vp.id = pp.project_id AND vp.user_id = $2
       )
       GROUP BY pp.id`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return { error: "Photo not found" }
    }

    return { data: result.rows[0] }
  } catch (error) {
    console.error("Error fetching photo:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Upload a photo
export async function uploadProjectPhoto(formData: FormData) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "You must be logged in to upload photos" }
    }

    const projectId = formData.get("project_id") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = (formData.get("category") as string) || "general"
    const isBefore = formData.get("is_before") === "true"
    const isAfter = formData.get("is_after") === "true"
    const isFeatured = formData.get("is_featured") === "true"
    const takenAt = formData.get("taken_at") as string
    const tagsString = formData.get("tags") as string
    const tags = tagsString ? JSON.parse(tagsString) : []

    // Handle file upload
    const photoFile = formData.get("photo") as File

    if (!photoFile || photoFile.size === 0) {
      return { error: "No photo provided" }
    }

    if (!projectId) {
      return { error: "Project ID is required" }
    }

    // Verify project ownership
    const projectCheck = await query(
      "SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2",
      [projectId, userId]
    )

    if (projectCheck.rows.length === 0) {
      return { error: "Project not found or access denied" }
    }

    // Save file
    const uploadResult = await saveUploadedFile(photoFile, "photos", userId, projectId)

    if (!uploadResult.success) {
      return { error: uploadResult.error }
    }

    // Insert the photo record
    const result = await query(
      `INSERT INTO project_photos 
       (project_id, photo_url, thumbnail_url, title, description, category, 
        is_before_photo, is_after_photo, is_featured, taken_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        projectId,
        uploadResult.url,
        uploadResult.url, // TODO: Generate actual thumbnail
        title || null,
        description || null,
        category,
        isBefore,
        isAfter,
        isFeatured,
        takenAt || null,
        JSON.stringify({
          originalFilename: uploadResult.fileName,
          size: uploadResult.fileSize,
          type: uploadResult.mimeType,
        }),
      ]
    )

    const photoId = result.rows[0].id

    // Handle tags if provided
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        let tagId = null

        if (tag.id) {
          // Use existing tag
          tagId = tag.id
        } else {
          // Create new tag
          const tagResult = await query(
            `INSERT INTO photo_tags (name, user_id) 
             VALUES ($1, $2) 
             ON CONFLICT (name, user_id) DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [tag.name, userId]
          )
          tagId = tagResult.rows[0].id
        }

        // Create tag relation
        await query(
          "INSERT INTO photo_tag_relations (photo_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [photoId, tagId]
        )
      }
    }

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error uploading photo:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Update photo details
export async function updatePhotoDetails(id: string, formData: FormData) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "You must be logged in to update photos" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const category = formData.get("category") as string
    const isBefore = formData.get("is_before") === "true"
    const isAfter = formData.get("is_after") === "true"
    const isFeatured = formData.get("is_featured") === "true"
    const takenAt = formData.get("taken_at") as string
    const tagsString = formData.get("tags") as string
    const tags = tagsString ? JSON.parse(tagsString) : []
    const projectId = formData.get("project_id") as string

    // Verify photo ownership
    const photoCheck = await query(
      `SELECT pp.id FROM project_photos pp
       JOIN vehicle_projects vp ON pp.project_id = vp.id
       WHERE pp.id = $1 AND vp.user_id = $2`,
      [id, userId]
    )

    if (photoCheck.rows.length === 0) {
      return { error: "Photo not found or access denied" }
    }

    // Update the photo record
    const result = await query(
      `UPDATE project_photos SET 
       title = $1, description = $2, category = $3, 
       is_before_photo = $4, is_after_photo = $5, is_featured = $6, 
       taken_at = $7, updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        title || null,
        description || null,
        category || "general",
        isBefore,
        isAfter,
        isFeatured,
        takenAt || null,
        id,
      ]
    )

    // Delete existing tag relations
    await query("DELETE FROM photo_tag_relations WHERE photo_id = $1", [id])

    // Add new tag relations
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        let tagId = null

        if (tag.id) {
          // Use existing tag
          tagId = tag.id
        } else {
          // Create new tag
          const tagResult = await query(
            `INSERT INTO photo_tags (name, user_id) 
             VALUES ($1, $2) 
             ON CONFLICT (name, user_id) DO UPDATE SET name = EXCLUDED.name
             RETURNING id`,
            [tag.name, userId]
          )
          tagId = tagResult.rows[0].id
        }

        // Create tag relation
        await query(
          "INSERT INTO photo_tag_relations (photo_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [id, tagId]
        )
      }
    }

    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath(`/dashboard/photos/${id}`)
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error updating photo:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Delete a photo
export async function deletePhoto(id: string, projectId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "Unauthorized" }
    }

    // First get the photo to get the storage path
    const photoResult = await query(
      `SELECT pp.photo_url FROM project_photos pp
       JOIN vehicle_projects vp ON pp.project_id = vp.id
       WHERE pp.id = $1 AND vp.user_id = $2`,
      [id, userId]
    )

    if (photoResult.rows.length === 0) {
      return { error: "Photo not found or access denied" }
    }

    const photo = photoResult.rows[0]

    // Delete the photo record (cascade will handle tag relations)
    await query("DELETE FROM project_photos WHERE id = $1", [id])

    // Delete file from storage if we have the URL
    if (photo.photo_url) {
      try {
        // Extract the relative path from the URL
        const url = new URL(photo.photo_url)
        const pathParts = url.pathname.split("/api/storage/")
        if (pathParts.length > 1) {
          const filePath = pathParts[1]
          await deleteStoredFile(filePath)
        }
      } catch (error) {
        console.error("Error deleting photo file:", error)
        // Continue even if file deletion fails
      }
    }

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error("Error deleting photo:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Get all tags for a user
export async function getUserTags() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return []
    }

    const result = await query(
      "SELECT * FROM photo_tags WHERE user_id = $1 ORDER BY name ASC",
      [userId]
    )

    return result.rows || []
  } catch (error) {
    console.error("Error fetching user tags:", error)
    return []
  }
}

// Get before/after photos for a project
export async function getBeforeAfterPhotos(projectId: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { before: [], after: [] }
    }

    // Get before photos
    const beforeResult = await query(
      `SELECT * FROM project_photos pp
       WHERE pp.project_id = $1 AND pp.is_before_photo = true
       AND EXISTS (
         SELECT 1 FROM vehicle_projects vp 
         WHERE vp.id = pp.project_id AND vp.user_id = $2
       )
       ORDER BY pp.created_at DESC`,
      [projectId, userId]
    )

    // Get after photos
    const afterResult = await query(
      `SELECT * FROM project_photos pp
       WHERE pp.project_id = $1 AND pp.is_after_photo = true
       AND EXISTS (
         SELECT 1 FROM vehicle_projects vp 
         WHERE vp.id = pp.project_id AND vp.user_id = $2
       )
       ORDER BY pp.created_at DESC`,
      [projectId, userId]
    )

    return {
      before: beforeResult.rows || [],
      after: afterResult.rows || [],
    }
  } catch (error) {
    console.error("Error fetching before/after photos:", error)
    return { before: [], after: [] }
  }
}

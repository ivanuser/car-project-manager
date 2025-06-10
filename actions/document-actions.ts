"use server"

import { revalidatePath } from "next/cache"
import { query } from "@/lib/db"
import { saveUploadedFile, deleteStoredFile } from "@/lib/file-storage"
import { getCurrentUserId } from "@/lib/auth-utils"

// Get all documents for a user
export async function getDocuments(projectId?: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return []
    }

    let sql = `
      SELECT d.*, 
             dc.name as category_name,
             vp.title as project_title,
             COALESCE(
               json_agg(
                 json_build_object('id', dt.id, 'name', dt.name)
               ) FILTER (WHERE dt.id IS NOT NULL), 
               '[]'
             ) as tags
      FROM documents d
      LEFT JOIN document_categories dc ON d.category_id = dc.id
      LEFT JOIN vehicle_projects vp ON d.project_id = vp.id
      LEFT JOIN document_tag_relations dtr ON d.id = dtr.document_id
      LEFT JOIN document_tags dt ON dtr.tag_id = dt.id
      WHERE d.user_id = $1
    `
    const params = [userId]

    if (projectId) {
      sql += " AND d.project_id = $2"
      params.push(projectId)
    }

    sql += `
      GROUP BY d.id, dc.name, vp.title
      ORDER BY d.created_at DESC
    `

    const result = await query(sql, params)
    return result.rows || []
  } catch (error) {
    console.error("Error fetching documents:", error)
    return []
  }
}

// Get a single document by ID
export async function getDocument(id: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "Unauthorized" }
    }

    const result = await query(
      `SELECT d.*, 
             dc.name as category_name,
             vp.title as project_title,
             COALESCE(
               json_agg(
                 json_build_object('id', dt.id, 'name', dt.name)
               ) FILTER (WHERE dt.id IS NOT NULL), 
               '[]'
             ) as tags
       FROM documents d
       LEFT JOIN document_categories dc ON d.category_id = dc.id
       LEFT JOIN vehicle_projects vp ON d.project_id = vp.id
       LEFT JOIN document_tag_relations dtr ON d.id = dtr.document_id
       LEFT JOIN document_tags dt ON dtr.tag_id = dt.id
       WHERE d.id = $1 AND d.user_id = $2
       GROUP BY d.id, dc.name, vp.title`,
      [id, userId]
    )

    if (result.rows.length === 0) {
      return { error: "Document not found" }
    }

    return { data: result.rows[0] }
  } catch (error) {
    console.error("Error fetching document:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Upload a document
export async function uploadDocument(formData: FormData) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "You must be logged in to upload documents" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const categoryId = formData.get("categoryId") as string
    const projectId = formData.get("projectId") as string
    const version = formData.get("version") as string
    const isPublic = formData.get("isPublic") === "true"
    const tagsString = formData.get("tags") as string
    const tags = tagsString ? tagsString.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0) : []

    // Handle file upload
    const file = formData.get("file") as File

    if (!file || file.size === 0) {
      return { error: "No file provided" }
    }

    if (!title) {
      return { error: "Title is required" }
    }

    // If project_id is provided, verify project ownership
    if (projectId && projectId !== "none") {
      const projectCheck = await query(
        "SELECT id FROM vehicle_projects WHERE id = $1 AND user_id = $2",
        [projectId, userId]
      )

      if (projectCheck.rows.length === 0) {
        return { error: "Project not found or access denied" }
      }
    }

    // Save file
    const uploadResult = await saveUploadedFile(
      file, 
      "documents", 
      userId, 
      projectId && projectId !== "none" ? projectId : undefined
    )

    if (!uploadResult.success) {
      return { error: uploadResult.error }
    }

    // Insert the document record
    const result = await query(
      `INSERT INTO documents 
       (title, description, file_url, file_type, file_size, file_name, 
        category_id, project_id, user_id, is_public, version)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [
        title,
        description || null,
        uploadResult.url,
        uploadResult.mimeType,
        uploadResult.fileSize,
        uploadResult.fileName,
        categoryId && categoryId !== "none" ? categoryId : null,
        projectId && projectId !== "none" ? projectId : null,
        userId,
        isPublic,
        version || null,
      ]
    )

    const documentId = result.rows[0].id

    // Handle tags if provided
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Create or get tag
        const tagResult = await query(
          `INSERT INTO document_tags (name, user_id) 
           VALUES ($1, $2) 
           ON CONFLICT (name, user_id) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [tagName, userId]
        )

        // Create tag relation
        await query(
          "INSERT INTO document_tag_relations (document_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [documentId, tagResult.rows[0].id]
        )
      }
    }

    revalidatePath("/dashboard/documents")
    if (projectId && projectId !== "none") {
      revalidatePath(`/dashboard/projects/${projectId}`)
    }
    
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error uploading document:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Update a document
export async function updateDocument(id: string, formData: FormData) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "You must be logged in to update documents" }
    }

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const categoryId = formData.get("categoryId") as string
    const projectId = formData.get("projectId") as string
    const version = formData.get("version") as string
    const isPublic = formData.get("isPublic") === "true"
    const tagsString = formData.get("tags") as string
    const tags = tagsString ? tagsString.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0) : []
    const file = formData.get("file") as File

    if (!title) {
      return { error: "Title is required" }
    }

    // Verify document ownership
    const documentCheck = await query(
      "SELECT * FROM documents WHERE id = $1 AND user_id = $2",
      [id, userId]
    )

    if (documentCheck.rows.length === 0) {
      return { error: "Document not found or access denied" }
    }

    const existingDocument = documentCheck.rows[0]
    let fileUrl = existingDocument.file_url
    let fileType = existingDocument.file_type
    let fileSize = existingDocument.file_size
    let fileName = existingDocument.file_name

    // Handle file replacement if new file provided
    if (file && file.size > 0) {
      // Delete old file
      if (existingDocument.file_url) {
        try {
          const url = new URL(existingDocument.file_url)
          const pathParts = url.pathname.split("/api/storage/")
          if (pathParts.length > 1) {
            await deleteStoredFile(pathParts[1])
          }
        } catch (error) {
          console.error("Error deleting old document file:", error)
        }
      }

      // Upload new file
      const uploadResult = await saveUploadedFile(
        file, 
        "documents", 
        userId, 
        projectId && projectId !== "none" ? projectId : undefined
      )

      if (!uploadResult.success) {
        return { error: uploadResult.error }
      }

      fileUrl = uploadResult.url
      fileType = uploadResult.mimeType
      fileSize = uploadResult.fileSize
      fileName = uploadResult.fileName
    }

    // Update the document record
    const result = await query(
      `UPDATE documents SET 
       title = $1, description = $2, file_url = $3, file_type = $4, 
       file_size = $5, file_name = $6, category_id = $7, project_id = $8, 
       is_public = $9, version = $10, updated_at = NOW()
       WHERE id = $11 AND user_id = $12
       RETURNING *`,
      [
        title,
        description || null,
        fileUrl,
        fileType,
        fileSize,
        fileName,
        categoryId && categoryId !== "none" ? categoryId : null,
        projectId && projectId !== "none" ? projectId : null,
        isPublic,
        version || null,
        id,
        userId,
      ]
    )

    // Delete existing tag relations
    await query("DELETE FROM document_tag_relations WHERE document_id = $1", [id])

    // Add new tag relations
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Create or get tag
        const tagResult = await query(
          `INSERT INTO document_tags (name, user_id) 
           VALUES ($1, $2) 
           ON CONFLICT (name, user_id) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [tagName, userId]
        )

        // Create tag relation
        await query(
          "INSERT INTO document_tag_relations (document_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
          [id, tagResult.rows[0].id]
        )
      }
    }

    revalidatePath("/dashboard/documents")
    revalidatePath(`/dashboard/documents/${id}`)
    if (projectId && projectId !== "none") {
      revalidatePath(`/dashboard/projects/${projectId}`)
    }
    
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error updating document:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Delete a document
export async function deleteDocument(id: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "Unauthorized" }
    }

    // Get document details first
    const documentResult = await query(
      "SELECT * FROM documents WHERE id = $1 AND user_id = $2",
      [id, userId]
    )

    if (documentResult.rows.length === 0) {
      return { error: "Document not found or access denied" }
    }

    const document = documentResult.rows[0]

    // Delete the document record (cascade will handle tag relations)
    await query("DELETE FROM documents WHERE id = $1", [id])

    // Delete file from storage
    if (document.file_url) {
      try {
        const url = new URL(document.file_url)
        const pathParts = url.pathname.split("/api/storage/")
        if (pathParts.length > 1) {
          await deleteStoredFile(pathParts[1])
        }
      } catch (error) {
        console.error("Error deleting document file:", error)
      }
    }

    revalidatePath("/dashboard/documents")
    if (document.project_id) {
      revalidatePath(`/dashboard/projects/${document.project_id}`)
    }
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting document:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Get document categories
export async function getDocumentCategories() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return []
    }

    const result = await query(
      "SELECT * FROM document_categories WHERE user_id = $1 ORDER BY name ASC",
      [userId]
    )

    return result.rows || []
  } catch (error) {
    console.error("Error fetching document categories:", error)
    return []
  }
}

// Create document category
export async function createDocumentCategory(name: string, description?: string, icon?: string, color?: string) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return { error: "Unauthorized" }
    }

    const result = await query(
      `INSERT INTO document_categories (name, description, icon, color, user_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, description || null, icon || null, color || null, userId]
    )

    revalidatePath("/dashboard/documents")
    return { success: true, data: result.rows[0] }
  } catch (error) {
    console.error("Error creating document category:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Get user's document tags
export async function getDocumentTags() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return []
    }

    const result = await query(
      "SELECT * FROM document_tags WHERE user_id = $1 ORDER BY name ASC",
      [userId]
    )

    return result.rows || []
  } catch (error) {
    console.error("Error fetching document tags:", error)
    return []
  }
}

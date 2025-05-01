"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"
import { redirect } from "next/navigation"

// Get all document categories for the current user
export async function getDocumentCategories() {
  const supabase = createServerClient()
  const isDevelopment = process.env.NODE_ENV === "development"

  // Get the current user or use development user ID
  let userId = "dev-user-id"

  if (!isDevelopment) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    userId = user.id
  }

  const { data, error } = await supabase
    .from("document_categories")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching document categories:", error)
    return []
  }

  return data || []
}

// Create a new document category
export async function createDocumentCategory(formData: FormData) {
  const supabase = createServerClient()
  const isDevelopment = process.env.NODE_ENV === "development"

  // Get the current user or use development user ID
  let userId = "dev-user-id"

  if (!isDevelopment) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to create a category" }
    }

    userId = user.id
  }

  const name = formData.get("name") as string
  const description = (formData.get("description") as string) || null
  const icon = (formData.get("icon") as string) || null

  const { data, error } = await supabase
    .from("document_categories")
    .insert({
      name,
      description,
      icon,
      user_id: userId,
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating document category:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/documents")
  return { success: true, data }
}

// Update a document category
export async function updateDocumentCategory(id: string, formData: FormData) {
  const supabase = createServerClient()

  const name = formData.get("name") as string
  const description = (formData.get("description") as string) || null
  const icon = (formData.get("icon") as string) || null

  const { data, error } = await supabase
    .from("document_categories")
    .update({
      name,
      description,
      icon,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating document category:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/documents")
  return { success: true, data }
}

// Delete a document category
export async function deleteDocumentCategory(id: string) {
  const supabase = createServerClient()

  const { error } = await supabase.from("document_categories").delete().eq("id", id)

  if (error) {
    console.error("Error deleting document category:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/documents")
  return { success: true }
}

// Get all documents for the current user
export async function getDocuments(options?: { projectId?: string; categoryId?: string }) {
  const supabase = createServerClient()
  const isDevelopment = process.env.NODE_ENV === "development"

  // Get the current user or use development user ID
  let userId = "dev-user-id"

  if (!isDevelopment) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    userId = user.id
  }

  let query = supabase
    .from("documents")
    .select(`
      *,
      document_categories(id, name, icon),
      vehicle_projects(id, title, make, model, year)
    `)
    .eq("user_id", userId)

  if (options?.projectId) {
    query = query.eq("project_id", options.projectId)
  }

  if (options?.categoryId) {
    query = query.eq("category_id", options.categoryId)
  }

  const { data, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching documents:", error)
    return []
  }

  return data || []
}

// Get a single document by ID
export async function getDocumentById(id: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from("documents")
    .select(`
      *,
      document_categories(id, name, icon),
      vehicle_projects(id, title, make, model, year)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error("Error fetching document:", error)
    return null
  }

  // Get tags for this document
  const { data: tagRelations, error: tagError } = await supabase
    .from("document_tag_relations")
    .select(`
      tag_id,
      document_tags(id, name)
    `)
    .eq("document_id", id)

  if (tagError) {
    console.error("Error fetching document tags:", tagError)
  } else {
    data.tags = tagRelations.map((relation) => relation.document_tags)
  }

  return data
}

// Upload and create a new document
export async function uploadDocument(formData: FormData) {
  const supabase = createServerClient()
  const isDevelopment = process.env.NODE_ENV === "development"

  // Get the current user or use development user ID
  let userId = "dev-user-id"

  if (!isDevelopment) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to upload a document" }
    }

    userId = user.id
  }

  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || null
  const categoryId = (formData.get("categoryId") as string) || null
  const projectId = (formData.get("projectId") as string) || null
  const version = (formData.get("version") as string) || null
  const isPublic = formData.get("isPublic") === "true"
  const tags = formData.get("tags") ? (formData.get("tags") as string).split(",") : []

  // Handle file upload
  const file = formData.get("file") as File

  if (!file || file.size === 0) {
    return { error: "No file provided" }
  }

  try {
    // Upload file to Supabase Storage
    const fileExt = file.name.split(".").pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`
    const { data: uploadData, error: uploadError } = await supabase.storage.from("documents").upload(fileName, file)

    if (uploadError) {
      console.error("Document upload error:", uploadError)
      return { error: uploadError.message }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName)
    const fileUrl = urlData.publicUrl

    // Generate thumbnail for PDFs if possible
    let thumbnailUrl = null
    if (file.type === "application/pdf") {
      // In a real implementation, you might use a service to generate PDF thumbnails
      // For now, we'll use a placeholder
      thumbnailUrl = "/pdf-document.png"
    }

    // Insert document record
    const { data, error } = await supabase
      .from("documents")
      .insert({
        title,
        description,
        file_url: fileUrl,
        file_type: file.type,
        file_size: file.size,
        file_name: file.name,
        category_id: categoryId,
        project_id: projectId,
        user_id: userId,
        is_public: isPublic,
        version,
        thumbnail_url: thumbnailUrl,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating document record:", error)
      return { error: error.message }
    }

    // Handle tags
    if (tags.length > 0) {
      for (const tagName of tags) {
        // Check if tag exists
        const { data: existingTag, error: tagError } = await supabase
          .from("document_tags")
          .select("id")
          .eq("name", tagName.trim())
          .eq("user_id", userId)
          .single()

        let tagId

        if (tagError) {
          // Create new tag
          const { data: newTag, error: createTagError } = await supabase
            .from("document_tags")
            .insert({
              name: tagName.trim(),
              user_id: userId,
            })
            .select("id")
            .single()

          if (createTagError) {
            console.error("Error creating tag:", createTagError)
            continue
          }

          tagId = newTag.id
        } else {
          tagId = existingTag.id
        }

        // Create tag relation
        await supabase.from("document_tag_relations").insert({
          document_id: data.id,
          tag_id: tagId,
        })
      }
    }

    revalidatePath("/dashboard/documents")
    if (projectId) {
      revalidatePath(`/dashboard/projects/${projectId}/documents`)
    }
    return { success: true, data }
  } catch (error) {
    console.error("Document upload error:", error)
    return { error: "An unexpected error occurred during document upload" }
  }
}

// Update a document
export async function updateDocument(id: string, formData: FormData) {
  const supabase = createServerClient()

  const title = formData.get("title") as string
  const description = (formData.get("description") as string) || null
  const categoryId = (formData.get("categoryId") as string) || null
  const projectId = (formData.get("projectId") as string) || null
  const version = (formData.get("version") as string) || null
  const isPublic = formData.get("isPublic") === "true"
  const tags = formData.get("tags") ? (formData.get("tags") as string).split(",") : []

  // Update document record
  const { data, error } = await supabase
    .from("documents")
    .update({
      title,
      description,
      category_id: categoryId,
      project_id: projectId,
      is_public: isPublic,
      version,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating document:", error)
    return { error: error.message }
  }

  // Handle file upload if a new file is provided
  const file = formData.get("file") as File

  if (file && file.size > 0) {
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${data.user_id}-${Date.now()}.${fileExt}`
      const { data: uploadData, error: uploadError } = await supabase.storage.from("documents").upload(fileName, file)

      if (uploadError) {
        console.error("Document upload error:", uploadError)
        return { error: uploadError.message }
      }

      // Get the public URL
      const { data: urlData } = supabase.storage.from("documents").getPublicUrl(fileName)
      const fileUrl = urlData.publicUrl

      // Generate thumbnail for PDFs if possible
      let thumbnailUrl = null
      if (file.type === "application/pdf") {
        // In a real implementation, you might use a service to generate PDF thumbnails
        thumbnailUrl = "/pdf-document.png"
      }

      // Update document with new file info
      await supabase
        .from("documents")
        .update({
          file_url: fileUrl,
          file_type: file.type,
          file_size: file.size,
          file_name: file.name,
          thumbnail_url: thumbnailUrl,
        })
        .eq("id", id)
    } catch (error) {
      console.error("Document upload error:", error)
      return { error: "An unexpected error occurred during document upload" }
    }
  }

  // Handle tags - first remove all existing tag relations
  await supabase.from("document_tag_relations").delete().eq("document_id", id)

  // Then add new tag relations
  if (tags.length > 0) {
    const userId = data.user_id

    for (const tagName of tags) {
      // Check if tag exists
      const { data: existingTag, error: tagError } = await supabase
        .from("document_tags")
        .select("id")
        .eq("name", tagName.trim())
        .eq("user_id", userId)
        .single()

      let tagId

      if (tagError) {
        // Create new tag
        const { data: newTag, error: createTagError } = await supabase
          .from("document_tags")
          .insert({
            name: tagName.trim(),
            user_id: userId,
          })
          .select("id")
          .single()

        if (createTagError) {
          console.error("Error creating tag:", createTagError)
          continue
        }

        tagId = newTag.id
      } else {
        tagId = existingTag.id
      }

      // Create tag relation
      await supabase.from("document_tag_relations").insert({
        document_id: id,
        tag_id: tagId,
      })
    }
  }

  revalidatePath("/dashboard/documents")
  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}/documents`)
  }
  revalidatePath(`/dashboard/documents/${id}`)
  return { success: true, data }
}

// Delete a document
export async function deleteDocument(id: string, projectId?: string) {
  const supabase = createServerClient()

  // Get the document to find the file path
  const { data: document, error: fetchError } = await supabase
    .from("documents")
    .select("file_url")
    .eq("id", id)
    .single()

  if (fetchError) {
    console.error("Error fetching document for deletion:", fetchError)
    return { error: fetchError.message }
  }

  // Delete the document record
  const { error } = await supabase.from("documents").delete().eq("id", id)

  if (error) {
    console.error("Error deleting document:", error)
    return { error: error.message }
  }

  // Try to delete the file from storage
  // This is a best effort - if it fails, we still consider the deletion successful
  try {
    if (document.file_url) {
      const fileName = document.file_url.split("/").pop()
      if (fileName) {
        await supabase.storage.from("documents").remove([fileName])
      }
    }
  } catch (storageError) {
    console.error("Error deleting document file from storage:", storageError)
  }

  revalidatePath("/dashboard/documents")
  if (projectId) {
    revalidatePath(`/dashboard/projects/${projectId}/documents`)
  }
  return { success: true }
}

// Get all document tags for the current user
export async function getDocumentTags() {
  const supabase = createServerClient()
  const isDevelopment = process.env.NODE_ENV === "development"

  // Get the current user or use development user ID
  let userId = "dev-user-id"

  if (!isDevelopment) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    userId = user.id
  }

  const { data, error } = await supabase
    .from("document_tags")
    .select("*")
    .eq("user_id", userId)
    .order("name", { ascending: true })

  if (error) {
    console.error("Error fetching document tags:", error)
    return []
  }

  return data || []
}

// Search documents
export async function searchDocuments(query: string) {
  const supabase = createServerClient()
  const isDevelopment = process.env.NODE_ENV === "development"

  // Get the current user or use development user ID
  let userId = "dev-user-id"

  if (!isDevelopment) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      redirect("/login")
    }

    userId = user.id
  }

  // Search in title, description, and file_name
  const { data, error } = await supabase
    .from("documents")
    .select(`
      *,
      document_categories(id, name, icon),
      vehicle_projects(id, title, make, model, year)
    `)
    .eq("user_id", userId)
    .or(`title.ilike.%${query}%,description.ilike.%${query}%,file_name.ilike.%${query}%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error searching documents:", error)
    return []
  }

  return data || []
}

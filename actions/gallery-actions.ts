"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

// Get all photos for a project
export async function getProjectPhotos(projectId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("project_photos")
      .select(`
        *,
        photo_tag_relations(
          tag_id,
          photo_tags(id, name)
        )
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching project photos:", error)
      return []
    }

    // Process the data to format tags
    const processedData = data.map((photo) => {
      const tags = photo.photo_tag_relations
        ? photo.photo_tag_relations.filter((relation) => relation.photo_tags).map((relation) => relation.photo_tags)
        : []

      return {
        ...photo,
        tags,
        photo_tag_relations: undefined,
      }
    })

    return processedData || []
  } catch (error) {
    console.error("Unexpected error fetching project photos:", error)
    return []
  }
}

// Get a single photo by ID
export async function getPhoto(id: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("project_photos")
      .select(`
        *,
        photo_tag_relations(
          tag_id,
          photo_tags(id, name)
        )
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching photo:", error)
      return { error: error.message }
    }

    // Process the data to format tags
    const tags = data.photo_tag_relations
      ? data.photo_tag_relations.filter((relation) => relation.photo_tags).map((relation) => relation.photo_tags)
      : []

    const processedData = {
      ...data,
      tags,
      photo_tag_relations: undefined,
    }

    return { data: processedData }
  } catch (error) {
    console.error("Unexpected error fetching photo:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Upload a photo
export async function uploadProjectPhoto(formData: FormData) {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
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

    // Generate a unique filename
    const fileExt = photoFile.name.split(".").pop()
    const fileName = `${user.id}-${uuidv4()}.${fileExt}`

    // Upload the original photo
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("project-photos")
      .upload(fileName, photoFile)

    if (uploadError) {
      console.error("Photo upload error:", uploadError)
      return { error: uploadError.message }
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("project-photos").getPublicUrl(fileName)
    const photoUrl = urlData.publicUrl

    // Create a thumbnail (in a real app, you'd resize the image)
    // For now, we'll use the same URL for both
    const thumbnailUrl = photoUrl

    // Insert the photo record
    const { data, error } = await supabase
      .from("project_photos")
      .insert({
        project_id: projectId,
        photo_url: photoUrl,
        thumbnail_url: thumbnailUrl,
        title: title || null,
        description: description || null,
        category: category || "general",
        is_before_photo: isBefore,
        is_after_photo: isAfter,
        is_featured: isFeatured,
        taken_at: takenAt || null,
        metadata: {
          originalFilename: photoFile.name,
          size: photoFile.size,
          type: photoFile.type,
        },
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating photo record:", error)
      return { error: error.message }
    }

    // Handle tags if provided
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        // Check if tag exists
        let tagId = null

        if (tag.id) {
          // Use existing tag
          tagId = tag.id
        } else {
          // Create new tag
          const { data: newTag, error: tagError } = await supabase
            .from("photo_tags")
            .insert({
              name: tag.name,
              user_id: user.id,
            })
            .select()
            .single()

          if (tagError) {
            console.error("Error creating tag:", tagError)
            continue
          }

          tagId = newTag.id
        }

        // Create tag relation
        await supabase.from("photo_tag_relations").insert({
          photo_id: data.id,
          tag_id: tagId,
        })
      }
    }

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error uploading photo:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Update photo details
export async function updatePhotoDetails(id: string, formData: FormData) {
  try {
    const supabase = createServerClient()

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

    // Update the photo record
    const { data, error } = await supabase
      .from("project_photos")
      .update({
        title: title || null,
        description: description || null,
        category: category || "general",
        is_before_photo: isBefore,
        is_after_photo: isAfter,
        is_featured: isFeatured,
        taken_at: takenAt || null,
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating photo:", error)
      return { error: error.message }
    }

    // Handle tags
    // First, get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: "You must be logged in to update photos" }
    }

    // Delete existing tag relations
    await supabase.from("photo_tag_relations").delete().eq("photo_id", id)

    // Add new tag relations
    if (tags && tags.length > 0) {
      for (const tag of tags) {
        // Check if tag exists
        let tagId = null

        if (tag.id) {
          // Use existing tag
          tagId = tag.id
        } else {
          // Create new tag
          const { data: newTag, error: tagError } = await supabase
            .from("photo_tags")
            .insert({
              name: tag.name,
              user_id: user.id,
            })
            .select()
            .single()

          if (tagError) {
            console.error("Error creating tag:", tagError)
            continue
          }

          tagId = newTag.id
        }

        // Create tag relation
        await supabase.from("photo_tag_relations").insert({
          photo_id: id,
          tag_id: tagId,
        })
      }
    }

    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath(`/dashboard/photos/${id}`)
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error updating photo:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Delete a photo
export async function deletePhoto(id: string, projectId: string) {
  try {
    const supabase = createServerClient()

    // First get the photo to get the storage path
    const { data: photo, error: fetchError } = await supabase
      .from("project_photos")
      .select("photo_url")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching photo for deletion:", fetchError)
      return { error: fetchError.message }
    }

    // Delete the photo from storage if we have the URL
    if (photo && photo.photo_url) {
      try {
        // Extract the filename from the URL
        const url = new URL(photo.photo_url)
        const pathParts = url.pathname.split("/")
        const filename = pathParts[pathParts.length - 1]

        // Delete from storage
        const { error: storageError } = await supabase.storage.from("project-photos").remove([filename])

        if (storageError) {
          console.error("Error deleting photo from storage:", storageError)
          // Continue with deletion from database even if storage deletion fails
        }
      } catch (error) {
        console.error("Error parsing photo URL:", error)
        // Continue with deletion from database
      }
    }

    // Delete the photo record
    const { error } = await supabase.from("project_photos").delete().eq("id", id)

    if (error) {
      console.error("Error deleting photo:", error)
      return { error: error.message }
    }

    revalidatePath(`/dashboard/projects/${projectId}`)
    return { success: true }
  } catch (error) {
    console.error("Unexpected error deleting photo:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Get all tags for a user
export async function getUserTags() {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    const { data, error } = await supabase
      .from("photo_tags")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching user tags:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error fetching user tags:", error)
    return []
  }
}

// Get before/after photos for a project
export async function getBeforeAfterPhotos(projectId: string) {
  try {
    const supabase = createServerClient()

    // Get before photos
    const { data: beforePhotos, error: beforeError } = await supabase
      .from("project_photos")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_before_photo", true)
      .order("created_at", { ascending: false })

    if (beforeError) {
      console.error("Error fetching before photos:", beforeError)
      return { before: [], after: [] }
    }

    // Get after photos
    const { data: afterPhotos, error: afterError } = await supabase
      .from("project_photos")
      .select("*")
      .eq("project_id", projectId)
      .eq("is_after_photo", true)
      .order("created_at", { ascending: false })

    if (afterError) {
      console.error("Error fetching after photos:", afterError)
      return { before: beforePhotos || [], after: [] }
    }

    return {
      before: beforePhotos || [],
      after: afterPhotos || [],
    }
  } catch (error) {
    console.error("Unexpected error fetching before/after photos:", error)
    return { before: [], after: [] }
  }
}

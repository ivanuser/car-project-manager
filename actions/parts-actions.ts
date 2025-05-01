"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"

// Get all parts
export async function getAllParts() {
  try {
    const supabase = createServerClient()
    const isDevelopment = process.env.NODE_ENV === "development"

    // Get the current user or use development user ID
    let userId = "dev-user-id"

    if (!isDevelopment) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { error: "You must be logged in to view parts" }
      }

      userId = user.id
    }

    // Modified query to avoid the relationship error
    const { data, error } = await supabase
      .from("project_parts")
      .select(`
        *,
        vehicle_projects (id, title, make, model, year)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching parts:", error)
      return { error: error.message }
    }

    // If we need vendor data, we can fetch it separately
    if (data && data.length > 0) {
      const vendorIds = data
        .filter((part) => part.vendor_id)
        .map((part) => part.vendor_id)
        .filter((id, index, self) => id && self.indexOf(id) === index) // Get unique vendor IDs

      if (vendorIds.length > 0) {
        const { data: vendors, error: vendorError } = await supabase
          .from("vendors")
          .select("id, name, website")
          .in("id", vendorIds)

        if (!vendorError && vendors) {
          // Add vendor data to parts
          data.forEach((part) => {
            if (part.vendor_id) {
              part.vendors = vendors.find((v) => v.id === part.vendor_id) || null
            } else {
              part.vendors = null
            }
          })
        }
      }
    }

    return { data }
  } catch (error) {
    console.error("Unexpected error fetching parts:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Get parts by project ID
export async function getPartsByProjectId(projectId: string) {
  try {
    const supabase = createServerClient()

    // Modified query to avoid the relationship error
    const { data, error } = await supabase
      .from("project_parts")
      .select(`
        *,
        vehicle_projects (id, title, make, model, year)
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching parts:", error)
      return []
    }

    // If we need vendor data, we can fetch it separately
    if (data && data.length > 0) {
      const vendorIds = data
        .filter((part) => part.vendor_id)
        .map((part) => part.vendor_id)
        .filter((id, index, self) => id && self.indexOf(id) === index) // Get unique vendor IDs

      if (vendorIds.length > 0) {
        const { data: vendors, error: vendorError } = await supabase
          .from("vendors")
          .select("id, name, website")
          .in("id", vendorIds)

        if (!vendorError && vendors) {
          // Add vendor data to parts
          data.forEach((part) => {
            if (part.vendor_id) {
              part.vendors = vendors.find((v) => v.id === part.vendor_id) || null
            } else {
              part.vendors = null
            }
          })
        }
      }
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error fetching parts:", error)
    return []
  }
}

// Get a single part by ID
export async function getPart(id: string) {
  try {
    const supabase = createServerClient()

    // Modified query to avoid the relationship error
    const { data, error } = await supabase
      .from("project_parts")
      .select(`
        *,
        vehicle_projects (id, title, make, model, year)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching part:", error)
      return { error: error.message }
    }

    // If we need vendor data, fetch it separately
    if (data && data.vendor_id) {
      const { data: vendor, error: vendorError } = await supabase
        .from("vendors")
        .select("id, name, website")
        .eq("id", data.vendor_id)
        .single()

      if (!vendorError && vendor) {
        data.vendors = vendor
      }
    } else if (data) {
      data.vendors = null
    }

    return { data }
  } catch (error) {
    console.error("Unexpected error fetching part:", error)
    return { error: "An unexpected error occurred" }
  }
}

// The rest of the file remains unchanged
export async function createPart(formData: FormData) {
  try {
    const supabase = createServerClient()
    const isDevelopment = process.env.NODE_ENV === "development"

    // Get the current user or use development user ID
    let userId = "dev-user-id"

    if (!isDevelopment) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { error: "You must be logged in to create a part" }
      }

      userId = user.id
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const partNumber = formData.get("part_number") as string
    const price = formData.get("price") ? Number.parseFloat(formData.get("price") as string) : null
    const quantity = Number.parseInt(formData.get("quantity") as string) || 1
    const status = formData.get("status") as string
    const condition = formData.get("condition") as string
    const location = formData.get("location") as string
    const projectId = formData.get("project_id") as string
    const vendorId = formData.get("vendor_id") as string
    const purchaseDate = formData.get("purchase_date") as string
    const purchaseUrl = formData.get("purchase_url") as string
    const imageUrl = formData.get("image_url") as string
    const notes = formData.get("notes") as string

    // Handle file upload if present
    let uploadedImageUrl = null
    const imageFile = formData.get("image") as File

    if (imageFile && imageFile.size > 0) {
      try {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("part-images")
          .upload(fileName, imageFile)

        if (uploadError) {
          console.error("Image upload error:", uploadError)
        } else if (uploadData) {
          const { data: urlData } = supabase.storage.from("part-images").getPublicUrl(fileName)

          uploadedImageUrl = urlData.publicUrl
        }
      } catch (error) {
        console.error("File upload error:", error)
      }
    }

    // Use the provided image URL or the uploaded one
    const finalImageUrl = uploadedImageUrl || imageUrl || null

    const { data, error } = await supabase
      .from("project_parts")
      .insert({
        name,
        description: description || null,
        part_number: partNumber || null,
        price,
        quantity,
        status: status || "needed",
        condition: condition || null,
        location: location || null,
        project_id: projectId,
        vendor_id: vendorId === "none" ? null : vendorId || null,
        purchase_date: purchaseDate || null,
        purchase_url: purchaseUrl || null,
        image_url: finalImageUrl,
        notes: notes || null,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating part:", error)
      return { error: error.message }
    }

    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/dashboard/parts")
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error creating part:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Update an existing part
export async function updatePart(formData: FormData) {
  try {
    const supabase = createServerClient()
    const id = formData.get("id") as string

    if (!id) {
      return { error: "Part ID is required" }
    }

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const partNumber = formData.get("part_number") as string
    const price = formData.get("price") ? Number.parseFloat(formData.get("price") as string) : null
    const quantity = Number.parseInt(formData.get("quantity") as string) || 1
    const status = formData.get("status") as string
    const condition = formData.get("condition") as string
    const location = formData.get("location") as string
    const projectId = formData.get("project_id") as string
    const vendorId = formData.get("vendor_id") as string
    const purchaseDate = formData.get("purchase_date") as string
    const purchaseUrl = formData.get("purchase_url") as string
    const imageUrl = formData.get("image_url") as string
    const notes = formData.get("notes") as string

    // Handle file upload if present
    let uploadedImageUrl = null
    const imageFile = formData.get("image") as File

    if (imageFile && imageFile.size > 0) {
      try {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData.user?.id || "dev-user-id"

        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("part-images")
          .upload(fileName, imageFile)

        if (uploadError) {
          console.error("Image upload error:", uploadError)
        } else if (uploadData) {
          const { data: urlData } = supabase.storage.from("part-images").getPublicUrl(fileName)

          uploadedImageUrl = urlData.publicUrl
        }
      } catch (error) {
        console.error("File upload error:", error)
      }
    }

    // Use the provided image URL or the uploaded one
    const finalImageUrl = uploadedImageUrl || imageUrl || null

    const { data, error } = await supabase
      .from("project_parts")
      .update({
        name,
        description: description || null,
        part_number: partNumber || null,
        price,
        quantity,
        status: status || "needed",
        condition: condition || null,
        location: location || null,
        project_id: projectId,
        vendor_id: vendorId === "none" ? null : vendorId || null,
        purchase_date: purchaseDate || null,
        purchase_url: purchaseUrl || null,
        image_url: finalImageUrl,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating part:", error)
      return { error: error.message }
    }

    revalidatePath(`/dashboard/parts/${id}`)
    revalidatePath(`/dashboard/projects/${projectId}`)
    revalidatePath("/dashboard/parts")
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error updating part:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Delete a part
export async function deletePart(id: string) {
  try {
    const supabase = createServerClient()

    // First get the part to know which paths to revalidate
    const { data: part, error: fetchError } = await supabase
      .from("project_parts")
      .select("project_id")
      .eq("id", id)
      .single()

    if (fetchError) {
      console.error("Error fetching part for deletion:", fetchError)
      return { error: fetchError.message }
    }

    const { error } = await supabase.from("project_parts").delete().eq("id", id)

    if (error) {
      console.error("Error deleting part:", error)
      return { error: error.message }
    }

    if (part) {
      revalidatePath(`/dashboard/projects/${part.project_id}`)
    }
    revalidatePath("/dashboard/parts")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error deleting part:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Get all vendors
export async function getVendors() {
  try {
    const supabase = createServerClient()
    const isDevelopment = process.env.NODE_ENV === "development"

    // Get the current user or use development user ID
    let userId = "dev-user-id"

    if (!isDevelopment) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { error: "You must be logged in to view vendors" }
      }

      userId = user.id
    }

    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching vendors:", error)
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error("Unexpected error fetching vendors:", error)
    return { error: "An unexpected error occurred", data: [] }
  }
}

// Create a new vendor
export async function createVendor(formData: FormData) {
  try {
    const supabase = createServerClient()
    const isDevelopment = process.env.NODE_ENV === "development"

    // Get the current user or use development user ID
    let userId = "dev-user-id"

    if (!isDevelopment) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { error: "You must be logged in to create a vendor" }
      }

      userId = user.id
    }

    const name = formData.get("name") as string
    const website = formData.get("website") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const notes = formData.get("notes") as string

    const { data, error } = await supabase
      .from("vendors")
      .insert({
        name,
        website: website || null,
        phone: phone || null,
        email: email || null,
        notes: notes || null,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating vendor:", error)
      return { error: error.message }
    }

    revalidatePath("/dashboard/parts")
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error creating vendor:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function getAllVendors() {
  try {
    const supabase = createServerClient()
    const isDevelopment = process.env.NODE_ENV === "development"

    // Get the current user or use development user ID
    let userId = "dev-user-id"

    if (!isDevelopment) {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        return { error: "You must be logged in to view vendors" }
      }

      userId = user.id
    }

    const { data, error } = await supabase
      .from("vendors")
      .select("*")
      .eq("user_id", userId)
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching vendors:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error fetching vendors:", error)
    return []
  }
}

// Add this function to the existing parts-actions.ts file

// Get parts by vendor ID
export async function getPartsByVendorId(vendorId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("project_parts")
      .select(`
        *,
        vehicle_projects (id, title, make, model, year)
      `)
      .eq("vendor_id", vendorId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching parts by vendor:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Unexpected error fetching parts by vendor:", error)
    return []
  }
}

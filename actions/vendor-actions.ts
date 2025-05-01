"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase"
import { getPartsByVendorId } from "@/actions/parts-actions"

// Get all vendors
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
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error("Unexpected error fetching vendors:", error)
    return { error: "An unexpected error occurred", data: [] }
  }
}

// Get a single vendor by ID
export async function getVendor(id: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("vendors").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching vendor:", error)
      return { error: error.message }
    }

    return { data }
  } catch (error) {
    console.error("Unexpected error fetching vendor:", error)
    return { error: "An unexpected error occurred" }
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
    const address = formData.get("address") as string
    const category = formData.get("category") as string
    const rating = formData.get("rating") ? Number.parseInt(formData.get("rating") as string) : null
    const notes = formData.get("notes") as string
    const contactName = formData.get("contact_name") as string
    const contactPosition = formData.get("contact_position") as string

    const { data, error } = await supabase
      .from("vendors")
      .insert({
        name,
        website: website || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        category: category || null,
        rating: rating || null,
        notes: notes || null,
        contact_name: contactName || null,
        contact_position: contactPosition || null,
        user_id: userId,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating vendor:", error)
      return { error: error.message }
    }

    revalidatePath("/dashboard/vendors")
    revalidatePath("/dashboard/parts")
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error creating vendor:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Update an existing vendor
export async function updateVendor(formData: FormData) {
  try {
    const supabase = createServerClient()
    const id = formData.get("id") as string

    if (!id) {
      return { error: "Vendor ID is required" }
    }

    const name = formData.get("name") as string
    const website = formData.get("website") as string
    const phone = formData.get("phone") as string
    const email = formData.get("email") as string
    const address = formData.get("address") as string
    const category = formData.get("category") as string
    const rating = formData.get("rating") ? Number.parseInt(formData.get("rating") as string) : null
    const notes = formData.get("notes") as string
    const contactName = formData.get("contact_name") as string
    const contactPosition = formData.get("contact_position") as string

    const { data, error } = await supabase
      .from("vendors")
      .update({
        name,
        website: website || null,
        phone: phone || null,
        email: email || null,
        address: address || null,
        category: category || null,
        rating: rating || null,
        notes: notes || null,
        contact_name: contactName || null,
        contact_position: contactPosition || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating vendor:", error)
      return { error: error.message }
    }

    revalidatePath(`/dashboard/vendors/${id}`)
    revalidatePath("/dashboard/vendors")
    revalidatePath("/dashboard/parts")
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error updating vendor:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Delete a vendor
export async function deleteVendor(id: string) {
  try {
    const supabase = createServerClient()

    // Check if vendor has associated parts
    const parts = await getPartsByVendorId(id)
    if (parts && parts.length > 0) {
      return {
        error: "This vendor has associated parts. Please reassign or delete those parts before deleting this vendor.",
        hasAssociatedParts: true,
        parts,
      }
    }

    const { error } = await supabase.from("vendors").delete().eq("id", id)

    if (error) {
      console.error("Error deleting vendor:", error)
      return { error: error.message }
    }

    revalidatePath("/dashboard/vendors")
    revalidatePath("/dashboard/parts")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error deleting vendor:", error)
    return { error: "An unexpected error occurred" }
  }
}

// Get vendor categories
export async function getVendorCategories() {
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
        return { error: "You must be logged in to view vendor categories" }
      }

      userId = user.id
    }

    // Get distinct categories from vendors
    const { data, error } = await supabase
      .from("vendors")
      .select("category")
      .eq("user_id", userId)
      .not("category", "is", null)
      .order("category", { ascending: true })

    if (error) {
      console.error("Error fetching vendor categories:", error)
      return { error: error.message }
    }

    // Extract unique categories
    const categories = [...new Set(data.map((item) => item.category))]

    return { data: categories }
  } catch (error) {
    console.error("Unexpected error fetching vendor categories:", error)
    return { error: "An unexpected error occurred", data: [] }
  }
}

// Get vendor spending analytics
export async function getVendorSpendingAnalytics() {
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
        return { error: "You must be logged in to view vendor analytics" }
      }

      userId = user.id
    }

    // Get all parts with vendor information
    const { data: parts, error } = await supabase
      .from("project_parts")
      .select(`
        price,
        quantity,
        vendor_id,
        vendors (name)
      `)
      .not("vendor_id", "is", null)
      .not("price", "is", null)

    if (error) {
      console.error("Error fetching vendor spending data:", error)
      return { error: error.message }
    }

    // Calculate spending by vendor
    const vendorSpending = parts.reduce((acc: Record<string, any>, part) => {
      const vendorId = part.vendor_id
      const vendorName = part.vendors?.name || "Unknown"
      const totalPrice = (part.price || 0) * (part.quantity || 1)

      if (!acc[vendorId]) {
        acc[vendorId] = {
          id: vendorId,
          name: vendorName,
          totalSpent: 0,
          partCount: 0,
        }
      }

      acc[vendorId].totalSpent += totalPrice
      acc[vendorId].partCount += 1

      return acc
    }, {})

    return { data: Object.values(vendorSpending) }
  } catch (error) {
    console.error("Unexpected error fetching vendor analytics:", error)
    return { error: "An unexpected error occurred", data: [] }
  }
}

"use server"

import { createServerClient } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

// Get user profile
export async function getUserProfile(userId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    console.error("Error fetching user profile:", error)
    return { error: error.message }
  }

  return { profile: data }
}

// Update user profile
export async function updateUserProfile(formData: FormData) {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Extract form data
  const fullName = formData.get("fullName") as string
  const bio = formData.get("bio") as string
  const location = formData.get("location") as string
  const website = formData.get("website") as string
  const expertiseLevel = formData.get("expertiseLevel") as string
  const phone = formData.get("phone") as string

  // Handle social links
  const socialLinks = {
    twitter: formData.get("twitter") as string,
    instagram: formData.get("instagram") as string,
    facebook: formData.get("facebook") as string,
    linkedin: formData.get("linkedin") as string,
    youtube: formData.get("youtube") as string,
  }

  // Update profile
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      bio,
      location,
      website,
      expertise_level: expertiseLevel,
      social_links: socialLinks,
      phone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (error) {
    console.error("Error updating profile:", error)
    return { error: error.message }
  }

  revalidatePath("/dashboard/profile")
  return { success: true }
}

// Update avatar
export async function updateAvatar(formData: FormData) {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  const avatarFile = formData.get("avatar") as File

  if (!avatarFile || avatarFile.size === 0) {
    return { error: "No file provided" }
  }

  // Upload avatar to storage
  const fileName = `avatar-${user.id}-${Date.now()}`
  const { data: uploadData, error: uploadError } = await supabase.storage.from("avatars").upload(fileName, avatarFile, {
    cacheControl: "3600",
    upsert: true,
  })

  if (uploadError) {
    console.error("Error uploading avatar:", uploadError)
    return { error: uploadError.message }
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(fileName)

  // Update profile with avatar URL
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      avatar_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id)

  if (updateError) {
    console.error("Error updating profile with avatar:", updateError)
    return { error: updateError.message }
  }

  revalidatePath("/dashboard/profile")
  return { success: true, avatarUrl: publicUrl }
}

// Get user preferences
export async function getUserPreferences(userId: string) {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("user_preferences").select("*").eq("id", userId).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "no rows returned" error
    console.error("Error fetching user preferences:", error)
    return { error: error.message }
  }

  // If no preferences exist yet, return default values
  if (!data) {
    return {
      preferences: {
        theme: "system",
        color_scheme: "default",
        background_intensity: "medium",
        ui_density: "comfortable",
        date_format: "MM/DD/YYYY",
        time_format: "12h",
        measurement_unit: "imperial",
        currency: "USD",
        notification_preferences: {
          email: true,
          push: true,
          maintenance: true,
          project_updates: true,
        },
        display_preferences: {
          default_project_view: "grid",
          default_task_view: "list",
          show_completed_tasks: true,
        },
      },
    }
  }

  return { preferences: data }
}

// Update user preferences
export async function updateUserPreferences(formData: FormData) {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Extract form data
  const theme = formData.get("theme") as string
  const colorScheme = formData.get("colorScheme") as string
  const backgroundIntensity = formData.get("backgroundIntensity") as string
  const uiDensity = formData.get("uiDensity") as string
  const dateFormat = formData.get("dateFormat") as string
  const timeFormat = formData.get("timeFormat") as string
  const measurementUnit = formData.get("measurementUnit") as string
  const currency = formData.get("currency") as string

  // Handle notification preferences
  const notificationPreferences = {
    email: formData.get("emailNotifications") === "on",
    push: formData.get("pushNotifications") === "on",
    maintenance: formData.get("maintenanceNotifications") === "on",
    project_updates: formData.get("projectUpdateNotifications") === "on",
  }

  // Handle display preferences
  const displayPreferences = {
    default_project_view: formData.get("defaultProjectView") as string,
    default_task_view: formData.get("defaultTaskView") as string,
    show_completed_tasks: formData.get("showCompletedTasks") === "on",
  }

  // Check if preferences already exist
  const { data: existingPrefs } = await supabase.from("user_preferences").select("id").eq("id", user.id).single()

  let result

  if (existingPrefs) {
    // Update existing preferences
    result = await supabase
      .from("user_preferences")
      .update({
        theme,
        color_scheme: colorScheme,
        background_intensity: backgroundIntensity,
        ui_density: uiDensity,
        date_format: dateFormat,
        time_format: timeFormat,
        measurement_unit: measurementUnit,
        currency,
        notification_preferences: notificationPreferences,
        display_preferences: displayPreferences,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
  } else {
    // Insert new preferences
    result = await supabase.from("user_preferences").insert({
      id: user.id,
      theme,
      color_scheme: colorScheme,
      background_intensity: backgroundIntensity,
      ui_density: uiDensity,
      date_format: dateFormat,
      time_format: timeFormat,
      measurement_unit: measurementUnit,
      currency,
      notification_preferences: notificationPreferences,
      display_preferences: displayPreferences,
    })
  }

  if (result.error) {
    console.error("Error updating preferences:", result.error)
    return { error: result.error.message }
  }

  revalidatePath("/dashboard/profile")
  revalidatePath("/dashboard/settings")
  return { success: true }
}

// Update password
export async function updatePassword(formData: FormData) {
  const supabase = createServerClient()

  const currentPassword = formData.get("currentPassword") as string
  const newPassword = formData.get("newPassword") as string

  // First verify the current password by attempting to sign in
  const {
    data: { user },
    error: signInError,
  } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: currentPassword,
  })

  if (signInError) {
    return { error: "Current password is incorrect" }
  }

  // Update the password
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    console.error("Error updating password:", error)
    return { error: error.message }
  }

  return { success: true }
}

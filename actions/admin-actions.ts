"use server"

import { createClient } from "@/lib/supabase"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export type UserStats = {
  totalUsers: number
  activeUsers: number
  newUsersToday: number
  newUsersThisWeek: number
  newUsersThisMonth: number
}

export type StorageStats = {
  totalStorage: number
  usedStorage: number
  documentsStorage: number
  imagesStorage: number
  otherStorage: number
}

export type SystemStats = {
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  uptime: number
  lastRestart: Date
}

export type ActivityLog = {
  id: string
  userId: string
  action: string
  resource: string
  resourceId: string | null
  timestamp: Date
  userEmail: string
  userName: string | null
}

export type UserGrowthData = {
  date: string
  count: number
}

export type AdminSettings = {
  maintenanceMode: boolean
  allowNewRegistrations: boolean
  maxUploadSize: number
  maxProjectsPerUser: number
  maxStoragePerUser: number
  systemAnnouncement: string | null
  systemAnnouncementActive: boolean
  systemAnnouncementExpiry: Date | null
}

export async function getUsers(page = 1, limit = 10, search = "") {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const startIndex = (page - 1) * limit

  let query = supabase
    .from("profiles")
    .select(`
      id,
      user_id,
      full_name,
      avatar_url,
      created_at,
      updated_at,
      auth.users!profiles_user_id_fkey (
        email,
        last_sign_in_at,
        confirmed_at,
        role
      )
    `)
    .range(startIndex, startIndex + limit - 1)
    .order("created_at", { ascending: false })

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,auth.users.email.ilike.%${search}%`)
  }

  const { data: users, error, count } = await query.returns<any[]>()

  if (error) {
    console.error("Error fetching users:", error)
    throw new Error("Failed to fetch users")
  }

  // Format the user data
  const formattedUsers = users.map((user) => ({
    id: user.user_id,
    name: user.full_name,
    email: user.auth?.users?.[0]?.email || "",
    avatarUrl: user.avatar_url,
    lastSignIn: user.auth?.users?.[0]?.last_sign_in_at || null,
    createdAt: user.created_at,
    confirmed: user.auth?.users?.[0]?.confirmed_at ? true : false,
    role: user.auth?.users?.[0]?.role || "user",
  }))

  return {
    users: formattedUsers,
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  }
}

export async function getUserStats(): Promise<UserStats> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
  const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString()
  const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString()

  // Get total users
  const { count: totalUsers, error: totalError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  if (totalError) {
    console.error("Error fetching total users:", totalError)
    throw new Error("Failed to fetch user stats")
  }

  // Get active users (signed in within last 30 days)
  const { count: activeUsers, error: activeError } = await supabase
    .from("auth.users")
    .select("*", { count: "exact", head: true })
    .gt("last_sign_in_at", thirtyDaysAgo)

  if (activeError) {
    console.error("Error fetching active users:", activeError)
    throw new Error("Failed to fetch user stats")
  }

  // Get new users today
  const { count: newUsersToday, error: todayError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", today)

  if (todayError) {
    console.error("Error fetching new users today:", todayError)
    throw new Error("Failed to fetch user stats")
  }

  // Get new users this week
  const { count: newUsersThisWeek, error: weekError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", weekAgo)

  if (weekError) {
    console.error("Error fetching new users this week:", weekError)
    throw new Error("Failed to fetch user stats")
  }

  // Get new users this month
  const { count: newUsersThisMonth, error: monthError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .gte("created_at", monthAgo)

  if (monthError) {
    console.error("Error fetching new users this month:", monthError)
    throw new Error("Failed to fetch user stats")
  }

  return {
    totalUsers: totalUsers || 0,
    activeUsers: activeUsers || 0,
    newUsersToday: newUsersToday || 0,
    newUsersThisWeek: newUsersThisWeek || 0,
    newUsersThisMonth: newUsersThisMonth || 0,
  }
}

export async function getStorageStats(): Promise<StorageStats> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // In a real application, you would query actual storage usage
  // For demo purposes, we'll simulate storage stats

  // Get total documents size
  const { data: documents, error: docsError } = await supabase.from("documents").select("file_size")

  if (docsError) {
    console.error("Error fetching document storage:", docsError)
    throw new Error("Failed to fetch storage stats")
  }

  // Get total images size
  const { data: photos, error: photosError } = await supabase.from("photos").select("file_size")

  if (photosError) {
    console.error("Error fetching photo storage:", photosError)
    throw new Error("Failed to fetch storage stats")
  }

  const documentsStorage = documents?.reduce((total, doc) => total + (doc.file_size || 0), 0) || 0
  const imagesStorage = photos?.reduce((total, photo) => total + (photo.file_size || 0), 0) || 0
  const otherStorage = 1024 * 1024 * 50 // 50MB for other storage (simulated)
  const usedStorage = documentsStorage + imagesStorage + otherStorage
  const totalStorage = 1024 * 1024 * 1024 * 10 // 10GB total storage (simulated)

  return {
    totalStorage,
    usedStorage,
    documentsStorage,
    imagesStorage,
    otherStorage,
  }
}

export async function getSystemStats(): Promise<SystemStats> {
  // In a real application, you would query actual system metrics
  // For demo purposes, we'll simulate system stats

  const uptime = 60 * 60 * 24 * 5 + 60 * 60 * 3 // 5 days and 3 hours in seconds
  const lastRestart = new Date(Date.now() - uptime * 1000)

  return {
    cpuUsage: 35 + Math.random() * 15, // 35-50%
    memoryUsage: 45 + Math.random() * 20, // 45-65%
    diskUsage: 62 + Math.random() * 5, // 62-67%
    uptime,
    lastRestart,
  }
}

export async function getActivityLogs(
  page = 1,
  limit = 20,
): Promise<{ logs: ActivityLog[]; total: number; pages: number }> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const startIndex = (page - 1) * limit

  const {
    data: logs,
    error,
    count,
  } = await supabase
    .from("admin_activity_logs")
    .select(
      `
      id,
      user_id,
      action,
      resource,
      resource_id,
      timestamp,
      profiles!admin_activity_logs_user_id_fkey (
        full_name
      ),
      auth.users!admin_activity_logs_user_id_fkey (
        email
      )
    `,
      { count: "exact" },
    )
    .range(startIndex, startIndex + limit - 1)
    .order("timestamp", { ascending: false })

  if (error) {
    console.error("Error fetching activity logs:", error)
    throw new Error("Failed to fetch activity logs")
  }

  const formattedLogs: ActivityLog[] = logs.map((log) => ({
    id: log.id,
    userId: log.user_id,
    action: log.action,
    resource: log.resource,
    resourceId: log.resource_id,
    timestamp: new Date(log.timestamp),
    userEmail: log.auth?.users?.[0]?.email || "",
    userName: log.profiles?.full_name || null,
  }))

  return {
    logs: formattedLogs,
    total: count || 0,
    pages: Math.ceil((count || 0) / limit),
  }
}

export async function getUserGrowthData(period: "week" | "month" | "year" = "month"): Promise<UserGrowthData[]> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const now = new Date()
  let startDate: Date
  let format: string

  // Determine the start date and format based on the period
  if (period === "week") {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    format = "YYYY-MM-DD"
  } else if (period === "month") {
    startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    format = "YYYY-MM-DD"
  } else {
    // year
    startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    format = "YYYY-MM"
  }

  // In a real application, you would query the database with date_trunc
  // For demo purposes, we'll simulate growth data

  const { data, error } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching user growth data:", error)
    throw new Error("Failed to fetch user growth data")
  }

  // Process the data to group by day/month
  const groupedData: Record<string, number> = {}

  // Initialize all dates in the range
  let currentDate = new Date(startDate)
  while (currentDate <= now) {
    const dateKey =
      period === "year"
        ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`
        : `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")}`

    groupedData[dateKey] = 0

    if (period === "year") {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    } else {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1)
    }
  }

  // Count users by date
  data?.forEach((user) => {
    const date = new Date(user.created_at)
    const dateKey =
      period === "year"
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

    if (groupedData[dateKey] !== undefined) {
      groupedData[dateKey]++
    }
  })

  // Convert to array format
  const result: UserGrowthData[] = Object.entries(groupedData).map(([date, count]) => ({
    date,
    count,
  }))

  return result
}

export async function getAdminSettings(): Promise<AdminSettings> {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.from("admin_settings").select("*").single()

  if (error) {
    console.error("Error fetching admin settings:", error)
    // Return default settings if not found
    return {
      maintenanceMode: false,
      allowNewRegistrations: true,
      maxUploadSize: 10 * 1024 * 1024, // 10MB
      maxProjectsPerUser: 10,
      maxStoragePerUser: 1024 * 1024 * 1024, // 1GB
      systemAnnouncement: null,
      systemAnnouncementActive: false,
      systemAnnouncementExpiry: null,
    }
  }

  return {
    maintenanceMode: data.maintenance_mode || false,
    allowNewRegistrations: data.allow_new_registrations !== false,
    maxUploadSize: data.max_upload_size || 10 * 1024 * 1024,
    maxProjectsPerUser: data.max_projects_per_user || 10,
    maxStoragePerUser: data.max_storage_per_user || 1024 * 1024 * 1024,
    systemAnnouncement: data.system_announcement,
    systemAnnouncementActive: data.system_announcement_active || false,
    systemAnnouncementExpiry: data.system_announcement_expiry ? new Date(data.system_announcement_expiry) : null,
  }
}

export async function updateAdminSettings(settings: Partial<AdminSettings>) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase
    .from("admin_settings")
    .update({
      maintenance_mode: settings.maintenanceMode,
      allow_new_registrations: settings.allowNewRegistrations,
      max_upload_size: settings.maxUploadSize,
      max_projects_per_user: settings.maxProjectsPerUser,
      max_storage_per_user: settings.maxStoragePerUser,
      system_announcement: settings.systemAnnouncement,
      system_announcement_active: settings.systemAnnouncementActive,
      system_announcement_expiry: settings.systemAnnouncementExpiry,
    })
    .eq("id", 1) // Assuming there's only one settings record

  if (error) {
    console.error("Error updating admin settings:", error)
    throw new Error("Failed to update admin settings")
  }

  revalidatePath("/admin/settings")
  return { success: true }
}

export async function updateUserRole(userId: string, role: "user" | "admin" | "moderator") {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // In a real application, you would use admin functions to update user roles
  // For demo purposes, we'll simulate this

  const { error } = await supabase.rpc("update_user_role", {
    user_id: userId,
    new_role: role,
  })

  if (error) {
    console.error("Error updating user role:", error)
    throw new Error("Failed to update user role")
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function suspendUser(userId: string, suspended: boolean) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // In a real application, you would use admin functions to suspend users
  // For demo purposes, we'll simulate this

  const { error } = await supabase.rpc("update_user_status", {
    user_id: userId,
    is_suspended: suspended,
  })

  if (error) {
    console.error("Error updating user suspension status:", error)
    throw new Error("Failed to update user suspension status")
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // In a real application, you would use admin functions to delete users
  // For demo purposes, we'll simulate this

  // First delete the profile
  const { error: profileError } = await supabase.from("profiles").delete().eq("user_id", userId)

  if (profileError) {
    console.error("Error deleting user profile:", profileError)
    throw new Error("Failed to delete user")
  }

  // Then delete the auth user (in a real app, this would be done with admin functions)
  const { error: authError } = await supabase.rpc("admin_delete_user", {
    user_id: userId,
  })

  if (authError) {
    console.error("Error deleting auth user:", authError)
    throw new Error("Failed to delete user")
  }

  revalidatePath("/admin/users")
  return { success: true }
}

export async function logAdminActivity(userId: string, action: string, resource: string, resourceId?: string) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.from("admin_activity_logs").insert({
    user_id: userId,
    action,
    resource,
    resource_id: resourceId || null,
    timestamp: new Date().toISOString(),
  })

  if (error) {
    console.error("Error logging admin activity:", error)
    // Don't throw here, just log the error
  }
}

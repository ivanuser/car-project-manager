"use server"

import db from "@/lib/db"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getCurrentUserId } from "@/lib/auth/current-user"

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
  try {
    const offset = (page - 1) * limit
    
    let query = `
      SELECT 
        p.id,
        p.user_id,
        p.full_name,
        p.avatar_url,
        p.created_at,
        p.updated_at,
        u.email,
        u.last_sign_in_at,
        u.email_confirmed_at,
        u.is_admin
      FROM profiles p
      LEFT JOIN auth.users u ON p.user_id = u.id
    `
    let params: any[] = []
    
    if (search) {
      query += ` WHERE p.full_name ILIKE $1 OR u.email ILIKE $1`
      params.push(`%${search}%`)
    }
    
    query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)
    
    const result = await db.query(query, params)
    
    // Get total count
    let countQuery = `SELECT COUNT(*) FROM profiles p LEFT JOIN auth.users u ON p.user_id = u.id`
    let countParams: any[] = []
    
    if (search) {
      countQuery += ` WHERE p.full_name ILIKE $1 OR u.email ILIKE $1`
      countParams.push(`%${search}%`)
    }
    
    const countResult = await db.query(countQuery, countParams)
    const total = parseInt(countResult.rows[0].count)
    
    const formattedUsers = result.rows.map((user) => ({
      id: user.user_id,
      name: user.full_name || '',
      email: user.email || '',
      avatarUrl: user.avatar_url,
      lastSignIn: user.last_sign_in_at,
      createdAt: user.created_at,
      confirmed: !!user.email_confirmed_at,
      role: user.is_admin ? 'admin' : 'user',
    }))

    return {
      users: formattedUsers,
      total,
      pages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return {
      users: [],
      total: 0,
      pages: 0,
    }
  }
}

export async function getUserStats(): Promise<UserStats> {
  try {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString()
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString()
    const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30).toISOString()

    // Get total users
    const totalResult = await db.query(`SELECT COUNT(*) FROM profiles`)
    const totalUsers = parseInt(totalResult.rows[0].count)

    // Get active users (signed in within last 30 days)
    const activeResult = await db.query(
      `SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > $1`,
      [thirtyDaysAgo]
    )
    const activeUsers = parseInt(activeResult.rows[0].count)

    // Get new users today
    const todayResult = await db.query(
      `SELECT COUNT(*) FROM profiles WHERE created_at >= $1`,
      [today]
    )
    const newUsersToday = parseInt(todayResult.rows[0].count)

    // Get new users this week
    const weekResult = await db.query(
      `SELECT COUNT(*) FROM profiles WHERE created_at >= $1`,
      [weekAgo]
    )
    const newUsersThisWeek = parseInt(weekResult.rows[0].count)

    // Get new users this month
    const monthResult = await db.query(
      `SELECT COUNT(*) FROM profiles WHERE created_at >= $1`,
      [monthAgo]
    )
    const newUsersThisMonth = parseInt(monthResult.rows[0].count)

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      newUsersToday: newUsersToday || 0,
      newUsersThisWeek: newUsersThisWeek || 0,
      newUsersThisMonth: newUsersThisMonth || 0,
    }
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return {
      totalUsers: 0,
      activeUsers: 0,
      newUsersToday: 0,
      newUsersThisWeek: 0,
      newUsersThisMonth: 0,
    }
  }
}

export async function getStorageStats(): Promise<StorageStats> {
  // For demo purposes, we'll simulate storage stats
  // In a real application, you would query actual storage usage
  
  const documentsStorage = 1024 * 1024 * 100 // 100MB for documents (simulated)
  const imagesStorage = 1024 * 1024 * 200 // 200MB for images (simulated)
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
  // For demo purposes, return empty logs
  // In a real application, you would have an admin_activity_logs table
  
  return {
    logs: [],
    total: 0,
    pages: 0,
  }
}

export async function getUserGrowthData(period: "week" | "month" | "year" = "month"): Promise<UserGrowthData[]> {
  try {
    const now = new Date()
    let startDate: Date

    if (period === "week") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    } else if (period === "month") {
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    } else {
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    }

    const result = await db.query(
      `SELECT created_at FROM profiles WHERE created_at >= $1 ORDER BY created_at`,
      [startDate.toISOString()]
    )

    // Process the data to group by day/month
    const groupedData: Record<string, number> = {}

    // Initialize all dates in the range
    let currentDate = new Date(startDate)
    while (currentDate <= now) {
      const dateKey = period === "year"
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
    result.rows.forEach((user) => {
      const date = new Date(user.created_at)
      const dateKey = period === "year"
        ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

      if (groupedData[dateKey] !== undefined) {
        groupedData[dateKey]++
      }
    })

    return Object.entries(groupedData).map(([date, count]) => ({
      date,
      count,
    }))
  } catch (error) {
    console.error("Error fetching user growth data:", error)
    return []
  }
}

export async function getAdminSettings(): Promise<AdminSettings> {
  // Return default settings for now
  // In a real application, you would have an admin_settings table
  
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

export async function updateAdminSettings(settings: Partial<AdminSettings>) {
  // For demo purposes, just revalidate the path
  // In a real application, you would update an admin_settings table
  
  revalidatePath("/admin/settings")
  return { success: true }
}

export async function updateUserRole(userId: string, role: "user" | "admin" | "moderator") {
  try {
    const isAdmin = role === "admin"
    
    await db.query(
      `UPDATE auth.users SET is_admin = $1 WHERE id = $2`,
      [isAdmin, userId]
    )

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error updating user role:", error)
    throw new Error("Failed to update user role")
  }
}

export async function suspendUser(userId: string, suspended: boolean) {
  // For demo purposes, just revalidate the path
  // In a real application, you would update user status
  
  revalidatePath("/admin/users")
  return { success: true }
}

export async function deleteUser(userId: string) {
  try {
    await db.transaction(async (client) => {
      // Delete user's projects and related data
      await client.query(`DELETE FROM vehicle_projects WHERE user_id = $1`, [userId])
      
      // Delete profile
      await client.query(`DELETE FROM profiles WHERE user_id = $1`, [userId])
      
      // Delete auth user
      await client.query(`DELETE FROM auth.users WHERE id = $1`, [userId])
    })

    revalidatePath("/admin/users")
    return { success: true }
  } catch (error) {
    console.error("Error deleting user:", error)
    throw new Error("Failed to delete user")
  }
}

export async function logAdminActivity(userId: string, action: string, resource: string, resourceId?: string) {
  // For demo purposes, just log to console
  // In a real application, you would have an admin_activity_logs table
  
  console.log(`Admin activity: ${userId} ${action} ${resource} ${resourceId || ''}`)
}

"use client"

import { useState } from "react"
import { AdminDashboardOverview } from "@/components/admin/dashboard-overview"
import { AdminQuickActions } from "@/components/admin/quick-actions"
import { AdminMetricsCards } from "@/components/admin/metrics-cards"
import { RecentActivityList } from "@/components/admin/recent-activity-list"
import { SystemHealthIndicators } from "@/components/admin/system-health-indicators"
import { UserGrowthChart } from "@/components/admin/user-growth-chart"
import { StorageChart } from "@/components/admin/storage-chart"

// Mock data
const mockUserStats = {
  totalUsers: 1254,
  activeUsers: 876,
  newUsersToday: 12,
  newUsersThisWeek: 87,
  newUsersThisMonth: 243,
}

const mockSystemStats = {
  cpuUsage: 42.5,
  memoryUsage: 58.3,
  diskUsage: 64.7,
  uptime: 432000, // 5 days in seconds
  lastRestart: new Date(Date.now() - 432000 * 1000),
}

const mockStorageStats = {
  totalStorage: 10737418240, // 10GB
  usedStorage: 3758096384, // 3.5GB
  documentsStorage: 1073741824, // 1GB
  imagesStorage: 2147483648, // 2GB
  otherStorage: 536870912, // 512MB
}

const mockUsers = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    avatarUrl: "/diverse-group-avatars.png",
    lastSignIn: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000).toISOString(),
    confirmed: true,
    role: "admin",
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    avatarUrl: null,
    lastSignIn: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    confirmed: true,
    role: "moderator",
  },
  {
    id: "user3",
    name: "Bob Johnson",
    email: "bob@example.com",
    avatarUrl: null,
    lastSignIn: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000).toISOString(),
    confirmed: true,
    role: "user",
  },
  {
    id: "user4",
    name: "Alice Williams",
    email: "alice@example.com",
    avatarUrl: null,
    lastSignIn: null,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    confirmed: false,
    role: "user",
  },
  {
    id: "user5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    avatarUrl: null,
    lastSignIn: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    confirmed: true,
    role: "user",
  },
]

const mockActivityLogs = [
  {
    id: "log1",
    userId: "user1",
    action: "login",
    resource: "auth",
    resourceId: null,
    timestamp: new Date(Date.now() - 1 * 3600 * 1000),
    userEmail: "john@example.com",
    userName: "John Doe",
  },
  {
    id: "log2",
    userId: "user2",
    action: "create",
    resource: "project",
    resourceId: "proj123",
    timestamp: new Date(Date.now() - 2 * 3600 * 1000),
    userEmail: "jane@example.com",
    userName: "Jane Smith",
  },
  {
    id: "log3",
    userId: "user3",
    action: "update",
    resource: "task",
    resourceId: "task456",
    timestamp: new Date(Date.now() - 3 * 3600 * 1000),
    userEmail: "bob@example.com",
    userName: "Bob Johnson",
  },
  {
    id: "log4",
    userId: "user1",
    action: "delete",
    resource: "document",
    resourceId: "doc789",
    timestamp: new Date(Date.now() - 4 * 3600 * 1000),
    userEmail: "john@example.com",
    userName: "John Doe",
  },
  {
    id: "log5",
    userId: "user5",
    action: "upload",
    resource: "photo",
    resourceId: "photo101",
    timestamp: new Date(Date.now() - 5 * 3600 * 1000),
    userEmail: "charlie@example.com",
    userName: "Charlie Brown",
  },
]

export function DemoAdmin() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="space-y-6 p-6">
      <AdminDashboardOverview />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <AdminMetricsCards />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminQuickActions />
        </div>
        <div>
          <SystemHealthIndicators />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <UserGrowthChart />
        <StorageChart />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <RecentActivityList />
        </div>
        <div className="space-y-6">{/* Additional admin widgets can go here */}</div>
      </div>
    </div>
  )
}

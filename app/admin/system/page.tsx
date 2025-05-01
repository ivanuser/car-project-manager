import { Suspense } from "react"
import { SystemStatusCard } from "@/components/admin/system-status-card"
import { StorageUsageCard } from "@/components/admin/storage-usage-card"
import { SystemLogsCard } from "@/components/admin/system-logs-card"

export default function SystemPage() {
  // In a real app, these would be fetched from an API
  const systemStats = {
    cpuUsage: 42.5,
    memoryUsage: 68.3,
    diskUsage: 57.2,
    uptime: 1209600, // 14 days in seconds
    lastRestart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  }

  const storageStats = {
    usedStorage: 256 * 1024 * 1024 * 1024, // 256 GB in bytes
    totalStorage: 500 * 1024 * 1024 * 1024, // 500 GB in bytes
    imagesStorage: 150 * 1024 * 1024 * 1024, // 150 GB in bytes
    documentsStorage: 75 * 1024 * 1024 * 1024, // 75 GB in bytes
    otherStorage: 31 * 1024 * 1024 * 1024, // 31 GB in bytes
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">System Status</h1>
      <p className="text-muted-foreground">Monitor and manage system resources and performance</p>

      <div className="grid gap-6 md:grid-cols-2">
        <Suspense fallback={<div className="h-[400px] rounded-lg bg-muted animate-pulse" />}>
          <SystemStatusCard stats={systemStats} />
        </Suspense>

        <Suspense fallback={<div className="h-[400px] rounded-lg bg-muted animate-pulse" />}>
          <StorageUsageCard stats={storageStats} />
        </Suspense>
      </div>

      <div className="grid gap-6">
        <Suspense fallback={<div className="h-[400px] rounded-lg bg-muted animate-pulse" />}>
          <SystemLogsCard />
        </Suspense>
      </div>
    </div>
  )
}

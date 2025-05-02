import { Suspense } from "react"
import { AdminDashboardOverview } from "@/components/admin/dashboard-overview"
import { AdminQuickActions } from "@/components/admin/quick-actions"
import { AdminMetricsCards } from "@/components/admin/metrics-cards"
import { RecentActivityList } from "@/components/admin/recent-activity-list"
import { SystemHealthIndicators } from "@/components/admin/system-health-indicators"
import { UserGrowthChart } from "@/components/admin/user-growth-chart"
import { StorageChart } from "@/components/admin/storage-chart"

export default function AdminPage() {
  return (
    <div className="space-y-6 p-6">
      <AdminDashboardOverview />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<div className="h-24 rounded-lg bg-muted animate-pulse" />}>
          <AdminMetricsCards />
        </Suspense>
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Car, ImageIcon, AlertTriangle } from "lucide-react"

export function AdminMetricsCards() {
  // In a real app, these would be fetched from an API
  const metrics = {
    totalUsers: 1248,
    totalProjects: 387,
    totalParts: 2956,
    totalVendors: 124,
    averageCompletionTime: "47 days",
    totalPhotos: 8742,
    storageUsed: "256 GB",
    activeAlerts: 3,
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalUsers}</div>
          <p className="text-xs text-muted-foreground">+12% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
          <Car className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalProjects}</div>
          <p className="text-xs text-muted-foreground">+7% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
          <ImageIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalPhotos}</div>
          <p className="text-xs text-muted-foreground">+23% from last month</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
          <AlertTriangle className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.activeAlerts}</div>
          <p className="text-xs text-muted-foreground">2 require attention</p>
        </CardContent>
      </Card>
    </>
  )
}

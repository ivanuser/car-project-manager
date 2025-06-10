"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { SystemStats } from "@/actions/admin-actions"
import { Clock, Cpu, RefreshCw } from "lucide-react"

export function SystemStatusCard({ stats }: { stats: SystemStats }) {
  // Format uptime
  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (24 * 3600))
    const hours = Math.floor((seconds % (24 * 3600)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    return `${days}d ${hours}h ${minutes}m`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cpu className="h-5 w-5" />
          System Performance
        </CardTitle>
        <CardDescription>Current system resource utilization and status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>CPU Usage</span>
            <span className="font-medium">{stats.cpuUsage.toFixed(1)}%</span>
          </div>
          <Progress value={stats.cpuUsage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Memory Usage</span>
            <span className="font-medium">{stats.memoryUsage.toFixed(1)}%</span>
          </div>
          <Progress value={stats.memoryUsage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Disk Usage</span>
            <span className="font-medium">{stats.diskUsage.toFixed(1)}%</span>
          </div>
          <Progress value={stats.diskUsage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Uptime</span>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{formatUptime(stats.uptime)}</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">Last Restart</span>
            <div className="flex items-center gap-1.5">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{stats.lastRestart.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

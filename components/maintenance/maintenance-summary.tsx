"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { AlertCircle, Bell, CheckCircle2, Clock, Plus, Wrench } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"

interface MaintenanceSummaryProps {
  schedules?: any[]
  logs?: any[]
}

export function MaintenanceSummary({ schedules = [], logs = [] }: MaintenanceSummaryProps) {
  const [stats, setStats] = useState({
    total: 0,
    overdue: 0,
    due: 0,
    upcoming: 0,
    totalCost: 0,
    recentLogs: []
  })

  useEffect(() => {
    if (schedules.length > 0 || logs.length > 0) {
      const overdue = schedules.filter(s => s.status === 'overdue').length
      const due = schedules.filter(s => s.status === 'due').length
      const upcoming = schedules.filter(s => s.status === 'upcoming').length
      
      // Calculate total maintenance cost from logs
      const totalCost = logs.reduce((sum: number, log: any) => {
        return sum + (log.cost || 0)
      }, 0)

      // Get recent logs (last 5)
      const recentLogs = logs
        .sort((a: any, b: any) => new Date(b.performed_at).getTime() - new Date(a.performed_at).getTime())
        .slice(0, 3)

      setStats({
        total: schedules.length,
        overdue,
        due,
        upcoming,
        totalCost,
        recentLogs
      })
    }
  }, [schedules, logs])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return 'text-red-500'
      case 'due':
        return 'text-yellow-500'
      case 'upcoming':
        return 'text-blue-500'
      default:
        return 'text-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'due':
        return <Bell className="h-4 w-4 text-yellow-500" />
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
  }

  if (schedules.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance
          </CardTitle>
          <CardDescription>
            Track maintenance schedules and service history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No maintenance schedules found</p>
            <Button asChild>
              <Link href="/dashboard/maintenance">
                <Plus className="mr-2 h-4 w-4" />
                Set Up Maintenance
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance
            </CardTitle>
            <CardDescription>
              {stats.total} active maintenance schedules
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/maintenance">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor('overdue')}`}>
              {stats.overdue}
            </div>
            <p className="text-xs text-muted-foreground">Overdue</p>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor('due')}`}>
              {stats.due}
            </div>
            <p className="text-xs text-muted-foreground">Due Soon</p>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${getStatusColor('upcoming')}`}>
              {stats.upcoming}
            </div>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
        </div>

        {/* Recent Activity */}
        {stats.recentLogs.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Recent Maintenance</h4>
            <div className="space-y-2">
              {stats.recentLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">{log.title}</p>
                    <p className="text-muted-foreground">
                      {new Date(log.performed_at).toLocaleDateString()}
                    </p>
                  </div>
                  {log.cost && (
                    <Badge variant="outline">
                      {formatCurrency(log.cost)}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Cost */}
        {stats.totalCost > 0 && (
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Maintenance Cost</span>
              <span className="font-medium">{formatCurrency(stats.totalCost)}</span>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href="/dashboard/maintenance">
              <Clock className="mr-2 h-4 w-4" />
              View Schedules
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href="/dashboard/maintenance?tab=history">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              View History
            </Link>
          </Button>
        </div>

        {/* Urgent Items */}
        {(stats.overdue > 0 || stats.due > 0) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">Attention Required</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              You have {stats.overdue + stats.due} maintenance item(s) that need attention.
            </p>
            <Button variant="outline" size="sm" className="mt-2" asChild>
              <Link href="/dashboard/maintenance?tab=overdue">
                Review Now
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

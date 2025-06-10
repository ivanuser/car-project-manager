"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Settings, Database, Shield, RefreshCw, HardDrive, Bell, FileText, Lock, Zap } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function AdminQuickActions() {
  const router = useRouter()
  const { toast } = useToast()

  const handleAction = (action: string) => {
    // In a real app, these would perform actual admin actions
    toast({
      title: "Admin Action",
      description: `${action} action initiated`,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>Common administrative tasks and controls</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 px-2 gap-2"
            onClick={() => router.push("/admin/users")}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs">Manage Users</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 px-2 gap-2"
            onClick={() => router.push("/admin/settings")}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs">System Settings</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 px-2 gap-2"
            onClick={() => handleAction("Database Backup")}
          >
            <Database className="h-5 w-5" />
            <span className="text-xs">Backup DB</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 px-2 gap-2"
            onClick={() => handleAction("Security Scan")}
          >
            <Shield className="h-5 w-5" />
            <span className="text-xs">Security Scan</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 px-2 gap-2"
            onClick={() => handleAction("Cache Clear")}
          >
            <RefreshCw className="h-5 w-5" />
            <span className="text-xs">Clear Cache</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 px-2 gap-2"
            onClick={() => router.push("/admin/system")}
          >
            <HardDrive className="h-5 w-5" />
            <span className="text-xs">System Status</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 px-2 gap-2"
            onClick={() => handleAction("Send Notification")}
          >
            <Bell className="h-5 w-5" />
            <span className="text-xs">Send Notice</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 px-2 gap-2"
            onClick={() => router.push("/admin/activity")}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs">View Logs</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 px-2 gap-2"
            onClick={() => handleAction("Permission Update")}
          >
            <Lock className="h-5 w-5" />
            <span className="text-xs">Permissions</span>
          </Button>

          <Button
            variant="outline"
            className="flex flex-col h-auto py-4 px-2 gap-2 bg-primary/10 hover:bg-primary/20 border-primary/20"
            onClick={() => handleAction("Maintenance Mode")}
          >
            <Settings className="h-5 w-5 text-primary" />
            <span className="text-xs">Maintenance</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

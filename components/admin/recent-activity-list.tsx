import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { UserPlus, Settings, Shield, Database, FileText, AlertTriangle } from "lucide-react"

export function RecentActivityList() {
  // In a real app, these would be fetched from an API
  const activities = [
    {
      id: 1,
      type: "user",
      action: "New user registered",
      details: "john.doe@example.com",
      time: "2 minutes ago",
      icon: UserPlus,
      iconColor: "text-green-500",
      iconBg: "bg-green-100 dark:bg-green-900/20",
    },
    {
      id: 2,
      type: "system",
      action: "System settings updated",
      details: "Email notification settings",
      time: "15 minutes ago",
      icon: Settings,
      iconColor: "text-blue-500",
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      id: 3,
      type: "security",
      action: "Failed login attempt",
      details: "IP: 192.168.1.105",
      time: "32 minutes ago",
      icon: Shield,
      iconColor: "text-red-500",
      iconBg: "bg-red-100 dark:bg-red-900/20",
    },
    {
      id: 4,
      type: "database",
      action: "Database backup completed",
      details: "Size: 2.3 GB",
      time: "1 hour ago",
      icon: Database,
      iconColor: "text-purple-500",
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      id: 5,
      type: "system",
      action: "System update available",
      details: "Version 2.4.0",
      time: "2 hours ago",
      icon: FileText,
      iconColor: "text-amber-500",
      iconBg: "bg-amber-100 dark:bg-amber-900/20",
    },
    {
      id: 6,
      type: "alert",
      action: "High CPU usage detected",
      details: "Server: app-server-03",
      time: "3 hours ago",
      icon: AlertTriangle,
      iconColor: "text-orange-500",
      iconBg: "bg-orange-100 dark:bg-orange-900/20",
    },
  ]

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "user":
        return "default"
      case "system":
        return "secondary"
      case "security":
        return "destructive"
      case "database":
        return "outline"
      case "alert":
        return "warning"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>System and user activity from the last 24 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon
              return (
                <div key={activity.id} className="flex items-start gap-4">
                  <div className={`${activity.iconBg} p-2 rounded-full`}>
                    <Icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <Badge variant={getTypeBadgeVariant(activity.type)} className="capitalize">
                        {activity.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

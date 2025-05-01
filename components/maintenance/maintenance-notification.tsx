"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { AlertCircle, Bell, CheckCircle, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { markNotificationAsRead, dismissNotification } from "@/actions/maintenance-actions"
import { useToast } from "@/hooks/use-toast"

interface MaintenanceNotificationProps {
  notification: any // Using any for simplicity, but should be properly typed
}

export function MaintenanceNotification({ notification }: MaintenanceNotificationProps) {
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)

  const handleMarkAsRead = async () => {
    setIsProcessing(true)
    try {
      await markNotificationAsRead(notification.id)
      toast({
        title: "Notification marked as read",
        description: "The notification has been marked as read",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDismiss = async () => {
    setIsProcessing(true)
    try {
      await dismissNotification(notification.id)
      toast({
        title: "Notification dismissed",
        description: "The notification has been dismissed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to dismiss notification",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const getNotificationIcon = () => {
    switch (notification.notification_type) {
      case "upcoming":
        return <Bell className="h-5 w-5 text-blue-500" />
      case "due":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "overdue":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Bell className="h-5 w-5" />
    }
  }

  const getNotificationColor = () => {
    switch (notification.notification_type) {
      case "upcoming":
        return "border-l-4 border-l-blue-500"
      case "due":
        return "border-l-4 border-l-yellow-500"
      case "overdue":
        return "border-l-4 border-l-red-500"
      default:
        return ""
    }
  }

  return (
    <Card className={`overflow-hidden ${getNotificationColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{getNotificationIcon()}</div>
          <div className="flex-1">
            <h4 className="font-medium">{notification.title}</h4>
            <p className="text-sm text-muted-foreground">{notification.message}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Due: {format(new Date(notification.scheduled_for), "MMM d, yyyy")}
            </p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleDismiss} disabled={isProcessing}>
            <X className="h-4 w-4" />
            <span className="sr-only">Dismiss</span>
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t bg-muted/50 p-2">
        <Button variant="ghost" size="sm" className="text-xs" onClick={handleMarkAsRead} disabled={isProcessing}>
          <CheckCircle className="mr-1 h-3 w-3" />
          Mark as read
        </Button>
        <Button variant="ghost" size="sm" className="text-xs" asChild>
          <Link href={`/dashboard/projects/${notification.maintenance_schedules.project_id}/maintenance`}>
            View details
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

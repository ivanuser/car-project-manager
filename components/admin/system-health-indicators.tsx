import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, AlertCircle, XCircle } from "lucide-react"

export function SystemHealthIndicators() {
  // In a real app, these would be fetched from an API
  const services = [
    { name: "Authentication Service", status: "operational", icon: CheckCircle2, color: "text-green-500" },
    { name: "Database Cluster", status: "operational", icon: CheckCircle2, color: "text-green-500" },
    { name: "Storage Service", status: "operational", icon: CheckCircle2, color: "text-green-500" },
    { name: "Email Service", status: "degraded", icon: AlertCircle, color: "text-amber-500" },
    { name: "Search Index", status: "operational", icon: CheckCircle2, color: "text-green-500" },
    { name: "Background Jobs", status: "operational", icon: CheckCircle2, color: "text-green-500" },
    { name: "External API", status: "down", icon: XCircle, color: "text-red-500" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Health</CardTitle>
        <CardDescription>Status of critical system components</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{service.name}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs capitalize">{service.status}</span>
                  <Icon className={`h-4 w-4 ${service.color}`} />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

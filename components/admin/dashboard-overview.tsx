import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ShieldCheck } from "lucide-react"

export function AdminDashboardOverview() {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <CardTitle>Admin Dashboard</CardTitle>
            <Badge variant="outline" className="ml-2">
              Administrator
            </Badge>
          </div>
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            System Online
          </Badge>
        </div>
        <CardDescription>Complete system overview and administrative controls for CAJPRO</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <p>
            Welcome to the administrative control panel. From here, you can manage users, monitor system performance,
            view analytics, and configure application settings. Use the quick actions below for common tasks or navigate
            to specific sections using the sidebar.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { format, addMonths } from "date-fns"
import { AlertCircle, CheckCircle2, Clock, MoreHorizontal, Plus, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"

export function DemoMaintenance() {
  const [activeTab, setActiveTab] = useState("upcoming")

  // Sample maintenance data
  const maintenanceItems = [
    {
      id: "1",
      title: "Oil Change",
      description: "Full synthetic oil change with filter replacement",
      vehicle: "1967 Mustang Restoration",
      interval: "Every 3,000 miles",
      lastPerformed: "Jan 15, 2023",
      lastMileage: 32500,
      nextDue: addMonths(new Date(), -1),
      nextMileage: 35500,
      status: "overdue",
      priority: "high",
    },
    {
      id: "2",
      title: "Tire Rotation",
      description: "Rotate tires to ensure even wear",
      vehicle: "1967 Mustang Restoration",
      interval: "Every 6,000 miles",
      lastPerformed: "Feb 20, 2023",
      lastMileage: 33000,
      nextDue: addMonths(new Date(), 1),
      nextMileage: 39000,
      status: "upcoming",
      priority: "medium",
    },
    {
      id: "3",
      title: "Brake Fluid Flush",
      description: "Replace brake fluid and bleed system",
      vehicle: "BMW M3 Engine Swap",
      interval: "Every 24 months",
      lastPerformed: "Mar 10, 2022",
      lastMileage: 28000,
      nextDue: new Date(),
      nextMileage: null,
      status: "due",
      priority: "critical",
    },
    {
      id: "4",
      title: "Air Filter Replacement",
      description: "Replace engine air filter",
      vehicle: "Jeep Wrangler Offroad Build",
      interval: "Every 15,000 miles",
      lastPerformed: "Apr 5, 2023",
      lastMileage: 42000,
      nextDue: addMonths(new Date(), 3),
      nextMileage: 57000,
      status: "upcoming",
      priority: "low",
    },
  ]

  // Sample service history
  const serviceHistory = [
    {
      id: "1",
      title: "Oil Change",
      vehicle: "1967 Mustang Restoration",
      performedDate: "Jan 15, 2023",
      mileage: 32500,
      cost: 89.99,
      notes: "Used Mobil 1 5W-30 Full Synthetic",
      partsUsed: ["Oil Filter", "5W-30 Synthetic Oil (5 qts)", "Drain Plug Gasket"],
    },
    {
      id: "2",
      title: "Brake Pad Replacement",
      vehicle: "BMW M3 Engine Swap",
      performedDate: "Dec 10, 2022",
      mileage: 27500,
      cost: 245.75,
      notes: "Replaced front and rear brake pads",
      partsUsed: ["Front Brake Pads", "Rear Brake Pads", "Brake Caliper Grease"],
    },
    {
      id: "3",
      title: "Suspension Upgrade",
      vehicle: "Jeep Wrangler Offroad Build",
      performedDate: "Nov 20, 2022",
      mileage: 38000,
      cost: 1250.0,
      notes: 'Installed 2.5" lift kit with new shocks',
      partsUsed: ["Lift Kit", "Fox Shocks", "Extended Brake Lines"],
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-500"
      case "due":
        return "bg-yellow-500"
      case "overdue":
        return "bg-red-500"
      case "completed":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "critical":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Clock className="h-4 w-4 text-blue-500" />
      case "due":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Maintenance Scheduler</h2>
          <p className="text-muted-foreground">Track service intervals and upcoming maintenance</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Schedule
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Across 3 vehicles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">1</div>
            <p className="text-xs text-muted-foreground">Needs immediate attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">2</div>
            <p className="text-xs text-muted-foreground">Within next 30 days</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Cost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,585.74</div>
            <p className="text-xs text-muted-foreground">Last 12 months</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming Maintenance</TabsTrigger>
          <TabsTrigger value="history">Service History</TabsTrigger>
          <TabsTrigger value="stats">Maintenance Stats</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="mt-4">
          <div className="space-y-4">
            {maintenanceItems.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        {item.title}
                      </CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Log Completion
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Edit Schedule
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Vehicle</p>
                      <p className="text-sm">{item.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Interval</p>
                      <p className="text-sm">{item.interval}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Performed</p>
                      <p className="text-sm">
                        {item.lastPerformed} ({item.lastMileage} miles)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Next Due</p>
                      <p className="text-sm">
                        {format(item.nextDue, "MMM d, yyyy")}
                        {item.nextMileage && ` (${item.nextMileage} miles)`}
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between pt-0">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getPriorityColor(item.priority)}>
                      {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                    </Badge>
                    <Badge className={`${getStatusColor(item.status)} text-white`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    Log Completion
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Service History</CardTitle>
              <CardDescription>Record of all maintenance performed on your vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {serviceHistory.map((service) => (
                  <div key={service.id} className="border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="font-medium">{service.title}</h4>
                        <p className="text-sm text-muted-foreground">{service.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{service.performedDate}</p>
                        <p className="text-sm text-muted-foreground">{service.mileage} miles</p>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-sm font-medium">Notes</p>
                        <p className="text-sm text-muted-foreground">{service.notes}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Parts Used</p>
                        <div className="flex flex-wrap gap-1">
                          {service.partsUsed.map((part, index) => (
                            <Badge key={index} variant="outline">
                              {part}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <p className="text-sm font-medium">Cost: {formatCurrency(service.cost)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="stats" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance by Vehicle</CardTitle>
                <CardDescription>Breakdown of maintenance costs by vehicle</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { vehicle: "1967 Mustang Restoration", cost: 850, percentage: 54 },
                    { vehicle: "BMW M3 Engine Swap", cost: 485, percentage: 31 },
                    { vehicle: "Jeep Wrangler Offroad Build", cost: 250, percentage: 15 },
                  ].map((item) => (
                    <div key={item.vehicle} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{item.vehicle}</p>
                        <p className="text-sm font-medium">{formatCurrency(item.cost)}</p>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">{item.percentage}% of total</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Maintenance by Type</CardTitle>
                <CardDescription>Breakdown of maintenance by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: "Regular Service", cost: 620, percentage: 39 },
                    { type: "Repairs", cost: 450, percentage: 28 },
                    { type: "Upgrades", cost: 350, percentage: 22 },
                    { type: "Inspections", cost: 165, percentage: 11 },
                  ].map((item) => (
                    <div key={item.type} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{item.type}</p>
                        <p className="text-sm font-medium">{formatCurrency(item.cost)}</p>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">{item.percentage}% of total</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

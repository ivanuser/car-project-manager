"use client"

import { useState } from "react"
import { DemoProjectCard } from "./demo-project-card"
import { DemoTaskList } from "./demo-task-list"
import { DemoBudgetChart } from "./demo-budget-chart"
import { DemoGallery } from "./demo-gallery"
import { DemoTimeline } from "./demo-timeline"
import { DemoMaintenance } from "./demo-maintenance"
import { DemoThemeShowcase } from "./demo-theme-showcase"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DemoExpenses } from "./demo-expenses"
import { DemoVendors } from "./demo-vendors"

interface DemoContentProps {
  activeTab: string
}

export function DemoContent({ activeTab }: DemoContentProps) {
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Reset selected project when tab changes
  if (activeTab !== "projects" && selectedProject) {
    setSelectedProject(null)
  }

  if (activeTab === "dashboard") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your car projects and activities</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DemoProjectCard
            title="1967 Mustang Restoration"
            description="Classic car restoration project"
            progress={65}
            status="In Progress"
            image="/vintage-mustang.png"
          />
          <DemoProjectCard
            title="BMW M3 Engine Swap"
            description="Performance upgrade project"
            progress={30}
            status="Planning"
            image="/bmw-m3-engine.png"
          />
          <DemoProjectCard
            title="Jeep Wrangler Offroad Build"
            description="Offroad modification project"
            progress={85}
            status="Almost Complete"
            image="/jeep-wrangler-offroad.png"
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Tasks</h3>
            <DemoTaskList />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Budget Overview</h3>
            <DemoBudgetChart />
          </div>
        </div>
      </div>
    )
  }

  if (activeTab === "projects") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage and track your vehicle projects</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DemoProjectCard
            title="1967 Mustang Restoration"
            description="Classic car restoration project"
            progress={65}
            status="In Progress"
            image="/vintage-mustang.png"
            details={{
              make: "Ford",
              model: "Mustang",
              year: 1967,
              budget: "$15,000",
              startDate: "March 15, 2023",
              estimatedCompletion: "November 30, 2023",
            }}
          />
          <DemoProjectCard
            title="BMW M3 Engine Swap"
            description="Performance upgrade project"
            progress={30}
            status="Planning"
            image="/bmw-m3-engine.png"
            details={{
              make: "BMW",
              model: "M3",
              year: 2015,
              budget: "$8,500",
              startDate: "June 10, 2023",
              estimatedCompletion: "August 20, 2023",
            }}
          />
          <DemoProjectCard
            title="Jeep Wrangler Offroad Build"
            description="Offroad modification project"
            progress={85}
            status="Almost Complete"
            image="/jeep-wrangler-offroad.png"
            details={{
              make: "Jeep",
              model: "Wrangler",
              year: 2020,
              budget: "$12,000",
              startDate: "January 5, 2023",
              estimatedCompletion: "July 15, 2023",
            }}
          />
          <DemoProjectCard
            title="Porsche 911 Maintenance"
            description="Regular maintenance and minor upgrades"
            progress={45}
            status="In Progress"
            image="/porsche-911.png"
            details={{
              make: "Porsche",
              model: "911",
              year: 2018,
              budget: "$4,500",
              startDate: "May 20, 2023",
              estimatedCompletion: "June 30, 2023",
            }}
          />
          <DemoProjectCard
            title="Tesla Model 3 Customization"
            description="Interior and exterior customization"
            progress={15}
            status="Just Started"
            image="/tesla-model-3.png"
            details={{
              make: "Tesla",
              model: "Model 3",
              year: 2022,
              budget: "$6,000",
              startDate: "July 1, 2023",
              estimatedCompletion: "September 15, 2023",
            }}
          />
          <DemoProjectCard
            title="Chevrolet Corvette Restoration"
            description="Classic Corvette full restoration"
            progress={5}
            status="Planning"
            image="/classic-corvette.png"
            details={{
              make: "Chevrolet",
              model: "Corvette",
              year: 1969,
              budget: "$25,000",
              startDate: "August 10, 2023",
              estimatedCompletion: "June 30, 2024",
            }}
          />
        </div>
      </div>
    )
  }

  if (activeTab === "tasks") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">Manage and track your project tasks</p>
        </div>

        <DemoTaskList extended />
      </div>
    )
  }

  if (activeTab === "gallery") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Photo Gallery</h2>
          <p className="text-muted-foreground">Document your progress with photos</p>
        </div>

        <DemoGallery />
      </div>
    )
  }

  if (activeTab === "timeline") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Timeline</h2>
          <p className="text-muted-foreground">View your project schedule and milestones</p>
        </div>

        <DemoTimeline />
      </div>
    )
  }

  if (activeTab === "maintenance") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Maintenance</h2>
          <p className="text-muted-foreground">Track vehicle maintenance schedules and history</p>
        </div>

        <DemoMaintenance />
      </div>
    )
  }

  if (activeTab === "settings") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Customize your CAJPRO experience</p>
        </div>

        <Tabs defaultValue="themes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="themes">Themes & Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                <DemoThemeShowcase />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Manage how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="font-medium">Email Notifications</div>
                      <div className="text-sm text-muted-foreground">Receive email updates about your projects</div>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="font-medium">Task Reminders</div>
                      <div className="text-sm text-muted-foreground">Get reminders for upcoming tasks</div>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="font-medium">Budget Alerts</div>
                      <div className="text-sm text-muted-foreground">Alerts when approaching budget limits</div>
                    </div>
                    <Switch defaultChecked={false} />
                  </div>
                  <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <div className="font-medium">Maintenance Reminders</div>
                      <div className="text-sm text-muted-foreground">Reminders for scheduled maintenance</div>
                    </div>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Display Name</label>
                      <input type="text" className="w-full rounded-md border p-2" defaultValue="John Smith" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email Address</label>
                      <input
                        type="email"
                        className="w-full rounded-md border p-2"
                        defaultValue="john.smith@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Profile Picture</label>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-muted"></div>
                      <button className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
                        Change Picture
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  if (activeTab === "expenses") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">Track and manage your project expenses</p>
        </div>

        <DemoExpenses />
      </div>
    )
  }

  if (activeTab === "vendors") {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Vendors</h2>
          <p className="text-muted-foreground">Manage your parts suppliers and service providers</p>
        </div>

        <DemoVendors />
      </div>
    )
  }

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <p className="text-muted-foreground">Select a tab to view content</p>
    </div>
  )
}

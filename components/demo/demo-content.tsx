"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DemoProjectCard } from "./demo-project-card"
import { DemoTaskList } from "./demo-task-list"
import { DemoBudgetChart } from "./demo-budget-chart"

interface DemoContentProps {
  activeTab: string
}

export function DemoContent({ activeTab }: DemoContentProps) {
  // Sample data
  const stats = [
    { title: "Total Projects", value: "3" },
    { title: "Active Tasks", value: "12" },
    { title: "Parts Inventory", value: "47" },
    { title: "Budget Used", value: "68%" },
  ]

  return (
    <div className="space-y-6 pb-16">
      {activeTab === "dashboard" && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Projects</CardTitle>
                <CardDescription>Your most recent vehicle projects</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <DemoProjectCard title="1967 Mustang Restoration" progress={75} image="/vintage-mustang.png" />
                <DemoProjectCard title="BMW M3 Engine Swap" progress={45} image="/bmw-m3-engine.png" />
                <DemoProjectCard title="Jeep Wrangler Offroad Build" progress={30} image="/jeep-wrangler-offroad.png" />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
                <CardDescription>Tasks due in the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <DemoTaskList limit={5} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>Your spending across all projects</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <DemoBudgetChart />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates from your projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: "2 hours ago", text: "Added new part: K&N Air Filter" },
                    { time: "5 hours ago", text: "Completed task: Install suspension kit" },
                    { time: "Yesterday", text: "Updated budget for BMW project" },
                    { time: "2 days ago", text: "Created new project: Jeep Wrangler Offroad Build" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4 text-sm">
                      <div className="min-w-24 text-muted-foreground">{item.time}</div>
                      <div>{item.text}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {activeTab === "projects" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Your Projects</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DemoProjectCard
              title="1967 Mustang Restoration"
              progress={75}
              image="/vintage-mustang.png"
              description="Full restoration of a classic 1967 Ford Mustang, including engine rebuild, interior restoration, and paint job."
            />
            <DemoProjectCard
              title="BMW M3 Engine Swap"
              progress={45}
              image="/bmw-m3-engine.png"
              description="Swapping the stock engine with an S55 twin-turbo inline-six from a 2018 M3 Competition."
            />
            <DemoProjectCard
              title="Jeep Wrangler Offroad Build"
              progress={30}
              image="/jeep-wrangler-offroad.png"
              description="Converting a stock Jeep Wrangler into an off-road beast with lift kit, winch, and custom bumpers."
            />
          </div>
        </div>
      )}

      {activeTab === "tasks" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Task Management</h2>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>All Tasks</CardTitle>
                  <CardDescription>View and manage all your project tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <DemoTaskList limit={10} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="upcoming" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>Tasks due in the next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <DemoTaskList limit={5} filter="upcoming" />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="completed" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Completed Tasks</CardTitle>
                  <CardDescription>Tasks you've already completed</CardDescription>
                </CardHeader>
                <CardContent>
                  <DemoTaskList limit={5} filter="completed" />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {activeTab === "budget" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Budget Tracking</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Budget Overview</CardTitle>
                <CardDescription>Your spending across all projects</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <DemoBudgetChart />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Budget Summary</CardTitle>
                <CardDescription>Financial overview of your projects</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { project: "Mustang Restoration", budget: "$12,000", spent: "$9,000", remaining: "$3,000" },
                    { project: "BMW Engine Swap", budget: "$8,500", spent: "$3,825", remaining: "$4,675" },
                    { project: "Jeep Wrangler Build", budget: "$6,000", spent: "$1,800", remaining: "$4,200" },
                  ].map((item, i) => (
                    <div key={i} className="grid grid-cols-4 text-sm">
                      <div className="font-medium">{item.project}</div>
                      <div className="text-muted-foreground">{item.budget}</div>
                      <div className="text-muted-foreground">{item.spent}</div>
                      <div className="font-medium">{item.remaining}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab !== "dashboard" && activeTab !== "projects" && activeTab !== "tasks" && activeTab !== "budget" && (
        <div className="flex h-[50vh] items-center justify-center rounded-lg border border-dashed">
          <div className="text-center">
            <h3 className="text-lg font-medium">Feature Preview</h3>
            <p className="text-sm text-muted-foreground">This feature is available in the full version</p>
          </div>
        </div>
      )}
    </div>
  )
}

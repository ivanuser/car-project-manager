"use client"

import { useState } from "react"
import { ArrowRight, Calendar, Car, DollarSign, Package, PenToolIcon as Tool, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DemoProjectCard } from "@/components/demo/demo-project-card"
import { DemoTaskList } from "@/components/demo/demo-task-list"
import { DemoBudgetChart } from "@/components/demo/demo-budget-chart"

export function DemoContent() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to CAJPRO Demo</h1>
          <p className="text-muted-foreground">
            This is an interactive demo of the CAJPRO platform. Explore the features below.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="budget">Budget</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">+1 from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">4 due this week</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Parts Inventory</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">28</div>
                  <p className="text-xs text-muted-foreground">3 awaiting delivery</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget Used</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68%</div>
                  <Progress value={68} className="h-2" />
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Recent Projects</CardTitle>
                </CardHeader>
                <CardContent className="pl-2">
                  <div className="flex flex-col gap-4">
                    <DemoProjectCard
                      title="1967 Mustang Restoration"
                      description="Full restoration of classic Mustang"
                      progress={75}
                      image="/vintage-mustang.png"
                    />
                    <DemoProjectCard
                      title="BMW M3 Performance Upgrade"
                      description="Engine and suspension modifications"
                      progress={45}
                      image="/bmw-m3-engine.png"
                    />
                    <DemoProjectCard
                      title="Jeep Wrangler Off-Road Build"
                      description="Lift kit and off-road modifications"
                      progress={30}
                      image="/jeep-wrangler-offroad.png"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" disabled>
                    View All Projects
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Upcoming Tasks</CardTitle>
                  <CardDescription>Tasks due in the next 7 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Tool className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Replace Carburetor</p>
                        <p className="text-xs text-muted-foreground">Mustang Restoration</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Tomorrow</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Tool className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Install Coilovers</p>
                        <p className="text-xs text-muted-foreground">BMW M3 Upgrade</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>In 2 days</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Tool className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Install Lift Kit</p>
                        <p className="text-xs text-muted-foreground">Jeep Wrangler Build</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>In 5 days</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="w-full" disabled>
                    View All Tasks
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <DemoProjectCard
                title="1967 Mustang Restoration"
                description="Full restoration of classic Mustang"
                progress={75}
                image="/vintage-mustang.png"
                expanded
              />
              <DemoProjectCard
                title="BMW M3 Performance Upgrade"
                description="Engine and suspension modifications"
                progress={45}
                image="/bmw-m3-engine.png"
                expanded
              />
              <DemoProjectCard
                title="Jeep Wrangler Off-Road Build"
                description="Lift kit and off-road modifications"
                progress={30}
                image="/jeep-wrangler-offroad.png"
                expanded
              />
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-4">
            <DemoTaskList />
          </TabsContent>

          <TabsContent value="budget" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">$15,000.00</div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="text-sm">Spent: $10,200.00</div>
                    <div className="text-sm text-muted-foreground">(68%)</div>
                  </div>
                  <Progress value={68} className="h-2 mt-2" />
                  <div className="mt-2 flex items-center gap-2">
                    <div className="text-sm">Remaining: $4,800.00</div>
                    <div className="text-sm text-muted-foreground">(32%)</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle>Budget Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <DemoBudgetChart />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

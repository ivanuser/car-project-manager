"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { DemoProjectCard } from "./demo-project-card"
import { DemoTaskList } from "./demo-task-list"
import { DemoBudgetChart } from "./demo-budget-chart"
import { DemoGallery } from "./demo-gallery"
import { DemoTimeline } from "./demo-timeline"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CalendarIcon, Clock, Settings, Plus } from "lucide-react"

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

  // Sample projects data with more details
  const projectsData = [
    {
      id: "1",
      title: "1967 Mustang Restoration",
      description: "Full restoration of a classic 1967 Ford Mustang Fastback",
      progress: 75,
      image: "/vintage-mustang.png",
      status: "In Progress",
      budget: "$12,000",
      spent: "$9,000",
      tasks: 18,
      completedTasks: 14,
      startDate: "Jan 15, 2023",
      estimatedCompletion: "Aug 30, 2023",
    },
    {
      id: "2",
      title: "BMW M3 Engine Swap",
      description: "Swapping an S55 engine into an E46 M3 chassis",
      progress: 45,
      image: "/bmw-m3-engine.png",
      status: "In Progress",
      budget: "$8,500",
      spent: "$3,825",
      tasks: 12,
      completedTasks: 5,
      startDate: "Mar 10, 2023",
      estimatedCompletion: "Oct 15, 2023",
    },
    {
      id: "3",
      title: "Jeep Wrangler Offroad Build",
      description: "Building a capable off-road Jeep Wrangler with lift kit and accessories",
      progress: 30,
      image: "/jeep-wrangler-offroad.png",
      status: "In Progress",
      budget: "$6,000",
      spent: "$1,800",
      tasks: 15,
      completedTasks: 4,
      startDate: "Apr 5, 2023",
      estimatedCompletion: "Nov 30, 2023",
    },
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
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
              <p className="text-muted-foreground">Manage and track your vehicle projects</p>
            </div>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>

          <div className="grid gap-6">
            {projectsData.map((project) => (
              <Card key={project.id} className="overflow-hidden">
                <div className="md:grid md:grid-cols-5">
                  <div className="relative h-48 md:col-span-1 md:h-full">
                    <img
                      src={project.image || "/placeholder.svg"}
                      alt={project.title}
                      className="h-full w-full object-cover"
                    />
                    <Badge className="absolute right-2 top-2">{project.status}</Badge>
                  </div>
                  <div className="p-6 md:col-span-4">
                    <CardHeader className="p-0 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <CardDescription className="mt-1">{project.description}</CardDescription>
                        </div>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0 pb-4">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <div>
                            <div className="mb-1 flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span className="font-medium">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-2" />
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Budget</p>
                              <p className="font-medium">{project.budget}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Spent</p>
                              <p className="font-medium">{project.spent}</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Tasks</p>
                            <p className="font-medium">
                              {project.completedTasks} / {project.tasks}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Start Date</p>
                            <div className="flex items-center gap-1">
                              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="font-medium">{project.startDate}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Est. Completion</p>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                              <p className="font-medium">{project.estimatedCompletion}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2 p-0">
                      <Button variant="outline">View Tasks</Button>
                      <Button variant="outline">View Parts</Button>
                      <Button variant="outline">View Gallery</Button>
                      <Button>View Details</Button>
                    </CardFooter>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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

      {activeTab === "gallery" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Project Gallery</h2>
          <p className="text-muted-foreground">Document your build with photos and before/after comparisons</p>
          <DemoGallery />
        </div>
      )}

      {activeTab === "timeline" && (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight">Timeline & Scheduling</h2>
          <p className="text-muted-foreground">
            Plan and track your project timeline with milestones and work sessions
          </p>
          <DemoTimeline />
        </div>
      )}

      {activeTab !== "dashboard" &&
        activeTab !== "projects" &&
        activeTab !== "tasks" &&
        activeTab !== "budget" &&
        activeTab !== "gallery" &&
        activeTab !== "timeline" && (
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

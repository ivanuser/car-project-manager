"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CompletionRateChart } from "@/components/reports/completion-rate-chart"
import { TimeTrackingChart } from "@/components/reports/time-tracking-chart"
import { StatusDistributionChart } from "@/components/reports/status-distribution-chart"
import { CompletionTrendChart } from "@/components/reports/completion-trend-chart"
import type {
  ProjectCompletionRate,
  BuildStageCompletionRate,
  TimeTrackingData,
  StatusDistribution,
  PriorityDistribution,
  CompletionTrend,
} from "@/utils/report-utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"

interface ReportsDetailProps {
  projectCompletionRates: ProjectCompletionRate[]
  buildStageCompletionRates: BuildStageCompletionRate[]
  timeTrackingData: TimeTrackingData[]
  statusDistribution: StatusDistribution[]
  priorityDistribution: PriorityDistribution[]
  completionTrends: CompletionTrend[]
}

export function ReportsDetail({
  projectCompletionRates,
  buildStageCompletionRates,
  timeTrackingData,
  statusDistribution,
  priorityDistribution,
  completionTrends,
}: ReportsDetailProps) {
  const [activeTab, setActiveTab] = useState("completion")

  return (
    <Tabs defaultValue="completion" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="completion">Completion Rates</TabsTrigger>
        <TabsTrigger value="time">Time Tracking</TabsTrigger>
        <TabsTrigger value="distribution">Task Distribution</TabsTrigger>
        <TabsTrigger value="trends">Trends</TabsTrigger>
      </TabsList>

      <TabsContent value="completion" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Project Completion Rates</CardTitle>
              <CardDescription>Task completion rates by project</CardDescription>
            </CardHeader>
            <CardContent>
              <CompletionRateChart data={projectCompletionRates} />
            </CardContent>
          </Card>

          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Build Stage Completion Rates</CardTitle>
              <CardDescription>Task completion rates by build stage</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Build Stage</TableHead>
                    <TableHead>Total Tasks</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {buildStageCompletionRates.map((stage) => (
                    <TableRow key={stage.buildStage}>
                      <TableCell className="font-medium">{stage.buildStage}</TableCell>
                      <TableCell>{stage.totalTasks}</TableCell>
                      <TableCell>{stage.completedTasks}</TableCell>
                      <TableCell>{stage.completionRate.toFixed(1)}%</TableCell>
                      <TableCell className="w-[200px]">
                        <Progress value={stage.completionRate} className="h-2" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="time" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Time Tracking</CardTitle>
            <CardDescription>Estimated vs. actual hours by project</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeTrackingChart data={timeTrackingData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Time Efficiency</CardTitle>
            <CardDescription>Comparison of estimated vs. actual hours</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Estimated Hours</TableHead>
                  <TableHead>Actual Hours</TableHead>
                  <TableHead>Efficiency</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeTrackingData.map((project) => (
                  <TableRow key={project.projectId}>
                    <TableCell className="font-medium">{project.projectTitle}</TableCell>
                    <TableCell>{project.estimatedHours.toFixed(1)}</TableCell>
                    <TableCell>{project.actualHours.toFixed(1)}</TableCell>
                    <TableCell>{(project.efficiency * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      {project.efficiency < 0.9 ? (
                        <span className="text-green-600">Under Budget</span>
                      ) : project.efficiency > 1.1 ? (
                        <span className="text-red-600">Over Budget</span>
                      ) : (
                        <span className="text-amber-600">On Track</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="distribution" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Status Distribution</CardTitle>
              <CardDescription>Distribution of tasks by status</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusDistributionChart data={statusDistribution} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority Distribution</CardTitle>
              <CardDescription>Distribution of tasks by priority</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Priority</TableHead>
                    <TableHead>Tasks</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priorityDistribution.map((priority) => (
                    <TableRow key={priority.priority}>
                      <TableCell className="font-medium">{priority.priority}</TableCell>
                      <TableCell>{priority.count}</TableCell>
                      <TableCell>{priority.percentage.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="trends" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Task Completion Trends</CardTitle>
            <CardDescription>Number of tasks completed over the last 30 days</CardDescription>
          </CardHeader>
          <CardContent>
            <CompletionTrendChart data={completionTrends} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

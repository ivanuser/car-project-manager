"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function StorageChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Storage Usage</CardTitle>
        <CardDescription>Storage usage by bucket</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Project Photos</span>
              <span className="text-sm font-medium">150 MB</span>
            </div>
            <Progress value={60} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Documents</span>
              <span className="text-sm font-medium">75 MB</span>
            </div>
            <Progress value={30} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Avatars</span>
              <span className="text-sm font-medium">30 MB</span>
            </div>
            <Progress value={10} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm">Temp</span>
              <span className="text-sm font-medium">1 MB</span>
            </div>
            <Progress value={1} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

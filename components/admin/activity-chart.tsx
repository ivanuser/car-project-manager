"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ActivityChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Activity</CardTitle>
        <CardDescription>User signups and active sessions over time</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[200px] flex items-end gap-2">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="bg-primary/90 rounded-sm w-full"
              style={{
                height: `${Math.max(15, Math.floor(Math.random() * 100))}%`,
                opacity: i > 25 ? 0.7 : i > 20 ? 0.8 : 1,
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

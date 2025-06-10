"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Terminal, RefreshCw, Download } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

type LogEntry = {
  timestamp: string
  level: "info" | "warning" | "error" | "debug"
  message: string
  source?: string
}

export function SystemLogsCard() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(false)

  // Simulate fetching logs
  const fetchLogs = async () => {
    setLoading(true)

    // In a real app, this would be an API call
    // For demo purposes, we'll generate mock logs
    setTimeout(() => {
      const mockLogs: LogEntry[] = [
        {
          timestamp: new Date().toISOString(),
          level: "info",
          message: "System started successfully",
          source: "system",
        },
        {
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          level: "info",
          message: "User authentication successful",
          source: "auth",
        },
        {
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          level: "warning",
          message: "High memory usage detected (75%)",
          source: "monitoring",
        },
        {
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          level: "error",
          message: "Database connection failed - retrying",
          source: "database",
        },
        {
          timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
          level: "info",
          message: "Scheduled backup completed successfully",
          source: "backup",
        },
        {
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          level: "debug",
          message: "Cache cleared due to memory pressure",
          source: "cache",
        },
        {
          timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
          level: "info",
          message: "New user registered: user123@example.com",
          source: "auth",
        },
        {
          timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
          level: "warning",
          message: "API rate limit approaching for client ID: client_123",
          source: "api",
        },
      ]

      setLogs(mockLogs)
      setLoading(false)
    }, 500)
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const getLogLevelStyle = (level: string) => {
    switch (level) {
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
      case "warning":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
      case "info":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "debug":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Terminal className="h-5 w-5" />
            System Logs
          </CardTitle>
          <CardDescription>Recent system events and notifications</CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border p-4 font-mono text-sm">
          {logs.map((log, index) => (
            <div key={index} className="mb-2 last:mb-0">
              <div className="flex items-start gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <span className={`rounded-full px-1.5 py-0.5 text-xs font-medium ${getLogLevelStyle(log.level)}`}>
                  {log.level.toUpperCase()}
                </span>
                {log.source && (
                  <span className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 rounded-full px-1.5 py-0.5 text-xs font-medium">
                    {log.source}
                  </span>
                )}
                <span className="flex-1">{log.message}</span>
              </div>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

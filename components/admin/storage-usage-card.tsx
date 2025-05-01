"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { StorageStats } from "@/actions/admin-actions"
import { FileImage, FileText, Files, HardDrive } from "lucide-react"

export function StorageUsageCard({ stats }: { stats: StorageStats }) {
  // Format bytes to human readable format
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"

    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Calculate percentage used
  const percentUsed = (stats.usedStorage / stats.totalStorage) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          Storage Usage
        </CardTitle>
        <CardDescription>Storage allocation and usage across the system</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Total Storage Used</span>
            <span className="font-medium">
              {formatBytes(stats.usedStorage)} / {formatBytes(stats.totalStorage)}
            </span>
          </div>
          <Progress value={percentUsed} className="h-2" />
          <p className="text-xs text-muted-foreground text-right">{percentUsed.toFixed(1)}% used</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-1.5 rounded-full">
                <FileImage className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span>Images</span>
            </div>
            <span className="font-medium">{formatBytes(stats.imagesStorage)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-amber-100 dark:bg-amber-900/30 p-1.5 rounded-full">
                <FileText className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              <span>Documents</span>
            </div>
            <span className="font-medium">{formatBytes(stats.documentsStorage)}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-gray-100 dark:bg-gray-800 p-1.5 rounded-full">
                <Files className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              </div>
              <span>Other</span>
            </div>
            <span className="font-medium">{formatBytes(stats.otherStorage)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

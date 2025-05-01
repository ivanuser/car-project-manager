"use client"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import type { ActivityLog } from "@/actions/admin-actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, ChevronRight, Search, RefreshCw } from "lucide-react"

export function ActivityLogTable({
  logs,
  currentPage,
  totalPages,
  totalLogs,
}: {
  logs: ActivityLog[]
  currentPage: number
  totalPages: number
  totalLogs: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [filter, setFilter] = useState("")

  const createPageURL = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams)
    params.set("page", pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.resource.toLowerCase().includes(filter.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(filter.toLowerCase()) ||
      (log.userName && log.userName.toLowerCase().includes(filter.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {logs.length} of {totalLogs} logs
        </p>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filter logs..."
              className="pl-8 w-[250px]"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => router.refresh()}>
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Resource ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No logs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">{log.timestamp.toLocaleString()}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{log.userName || "Unknown"}</span>
                      <span className="text-xs text-muted-foreground">{log.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getActionColor(log.action)}`}
                    >
                      {log.action}
                    </span>
                  </TableCell>
                  <TableCell>{log.resource}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {log.resourceId ? log.resourceId.substring(0, 8) : "N/A"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(createPageURL(currentPage - 1))}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <div className="flex items-center justify-center text-sm font-medium">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(createPageURL(currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}

function getActionColor(action: string): string {
  const actionLower = action.toLowerCase()

  if (actionLower.includes("create") || actionLower.includes("add")) {
    return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  }

  if (actionLower.includes("delete") || actionLower.includes("remove")) {
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  }

  if (actionLower.includes("update") || actionLower.includes("edit") || actionLower.includes("modify")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
  }

  if (actionLower.includes("login") || actionLower.includes("logout") || actionLower.includes("auth")) {
    return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
  }

  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
}

"use client"

import { format } from "date-fns"
import type { MaintenanceLog } from "@/actions/maintenance-actions"
import { formatCurrency } from "@/lib/utils"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface MaintenanceLogsTableProps {
  logs: MaintenanceLog[]
  projectId: string
}

export function MaintenanceLogsTable({ logs }: MaintenanceLogsTableProps) {
  if (logs.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground">No maintenance logs found</p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Service</TableHead>
            <TableHead className="hidden md:table-cell">Reading</TableHead>
            <TableHead className="hidden md:table-cell">Cost</TableHead>
            <TableHead className="hidden lg:table-cell">Parts Used</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{format(new Date(log.performed_at), "MMM d, yyyy")}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{log.title}</p>
                  {log.description && <p className="text-sm text-muted-foreground">{log.description}</p>}
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {log.performed_value !== undefined && log.performed_value !== null ? log.performed_value : "N/A"}
              </TableCell>
              <TableCell className="hidden md:table-cell">{log.cost ? formatCurrency(log.cost) : "N/A"}</TableCell>
              <TableCell className="hidden lg:table-cell">
                {log.parts_used && log.parts_used.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {log.parts_used.map((part, index) => (
                      <Badge key={index} variant="outline">
                        {part}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  "None"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

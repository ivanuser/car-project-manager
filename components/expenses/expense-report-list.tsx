"use client"

import Link from "next/link"
import { FileText, Plus, Clock, Check, X, AlertTriangle, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/utils/format-utils"
import type { ExpenseReport } from "@/actions/expense-actions"

interface ExpenseReportListProps {
  reports: ExpenseReport[]
}

export function ExpenseReportList({ reports }: ExpenseReportListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <Clock className="h-5 w-5 text-muted-foreground" />
      case "submitted":
        return <AlertTriangle className="h-5 w-5 text-warning" />
      case "approved":
        return <Check className="h-5 w-5 text-success" />
      case "rejected":
        return <X className="h-5 w-5 text-destructive" />
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Draft</Badge>
      case "submitted":
        return <Badge className="bg-warning text-warning-foreground">Submitted</Badge>
      case "approved":
        return <Badge className="bg-success text-success-foreground">Approved</Badge>
      case "rejected":
        return <Badge className="bg-destructive text-destructive-foreground">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expense Reports</h2>
          <p className="text-muted-foreground">Manage and track your expense reports</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/expenses/new">
            <Plus className="mr-2 h-4 w-4" />
            New Report
          </Link>
        </Button>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No expense reports yet</h3>
            <p className="text-muted-foreground mb-4">Create your first expense report to get started</p>
            <Button asChild>
              <Link href="/dashboard/expenses/new">
                <Plus className="mr-2 h-4 w-4" />
                New Report
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-full bg-muted">{getStatusIcon(report.status)}</div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
                <CardDescription>
                  {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center py-2">
                  <div>
                    <p className="text-sm font-medium">Total Amount</p>
                    <p className="text-xl font-bold">{formatCurrency(report.total_amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Items</p>
                    <p className="text-xl font-bold text-center">{report.items?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 pt-2">
                <Button variant="ghost" className="w-full justify-between" asChild>
                  <Link href={`/dashboard/expenses/${report.id}`}>
                    View Details
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

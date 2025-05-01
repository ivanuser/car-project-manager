"use client"

import { useState } from "react"
import { Receipt, FileText, BarChart2, Upload, Plus, Clock, Check, X, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

export function DemoExpenses() {
  const [activeTab, setActiveTab] = useState("overview")
  const [scanningReceipt, setScanningReceipt] = useState(false)

  const handleScanReceipt = () => {
    setScanningReceipt(true)
    // Simulate scanning process
    setTimeout(() => {
      setScanningReceipt(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                <CardDescription>Current month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$4,250.00</div>
                <p className="text-xs text-muted-foreground mt-1">28 expense items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Budget Utilization</CardTitle>
                <CardDescription>$4,250 of $6,000</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">70.8%</div>
                <Progress value={70.8} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <CardDescription>Expense reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2</div>
                <p className="text-xs text-muted-foreground mt-1">Submitted reports awaiting review</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your expenses</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <Button
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center gap-2"
                  onClick={handleScanReceipt}
                  disabled={scanningReceipt}
                >
                  {scanningReceipt ? (
                    <>
                      <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <span>Scanning...</span>
                    </>
                  ) : (
                    <>
                      <Receipt className="h-8 w-8" />
                      <span>Scan Receipt</span>
                    </>
                  )}
                </Button>

                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <Plus className="h-8 w-8" />
                  <span>Add Expense</span>
                </Button>

                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <FileText className="h-8 w-8" />
                  <span>New Report</span>
                </Button>

                <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2">
                  <BarChart2 className="h-8 w-8" />
                  <span>View Analytics</span>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
                <CardDescription>Your latest transactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "Auto Parts Store",
                    amount: "$350.75",
                    date: "Today",
                    category: "Parts",
                  },
                  {
                    title: "Tool Warehouse",
                    amount: "$129.99",
                    date: "Yesterday",
                    category: "Tools",
                  },
                  {
                    title: "Paint Supplies",
                    amount: "$215.50",
                    date: "3 days ago",
                    category: "Materials",
                  },
                  {
                    title: "Workshop Rental",
                    amount: "$800.00",
                    date: "1 week ago",
                    category: "Facilities",
                  },
                ].map((expense, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{expense.title}</div>
                      <div className="text-sm text-muted-foreground">{expense.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{expense.amount}</div>
                      <Badge variant="outline" className="text-xs">
                        {expense.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6 pt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "June 2023 Expenses",
                status: "approved",
                amount: "$2,450.75",
                items: 18,
                dateRange: "Jun 1 - Jun 30, 2023",
              },
              {
                title: "July 2023 Expenses",
                status: "submitted",
                amount: "$1,875.25",
                items: 12,
                dateRange: "Jul 1 - Jul 31, 2023",
              },
              {
                title: "Mustang Parts",
                status: "draft",
                amount: "$3,250.00",
                items: 8,
                dateRange: "Aug 1 - Aug 15, 2023",
              },
              {
                title: "Workshop Equipment",
                status: "rejected",
                amount: "$1,200.00",
                items: 3,
                dateRange: "Jul 15 - Aug 5, 2023",
              },
              {
                title: "BMW Project",
                status: "submitted",
                amount: "$950.50",
                items: 6,
                dateRange: "Aug 10 - Aug 20, 2023",
              },
            ].map((report, i) => {
              const getStatusIcon = (status: string) => {
                switch (status) {
                  case "draft":
                    return <Clock className="h-5 w-5 text-muted-foreground" />
                  case "submitted":
                    return <Upload className="h-5 w-5 text-warning" />
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
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-full bg-muted">{getStatusIcon(report.status)}</div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                    <CardDescription>{report.dateRange}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center py-2">
                      <div>
                        <p className="text-sm font-medium">Total Amount</p>
                        <p className="text-xl font-bold">{report.amount}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Items</p>
                        <p className="text-xl font-bold text-center">{report.items}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 pt-2">
                    <Button variant="ghost" className="w-full justify-between">
                      View Details
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Analytics</CardTitle>
              <CardDescription>Breakdown of your expenses by category</CardDescription>
            </CardHeader>
            <CardContent className="px-2">
              <div className="h-80 w-full">
                <div className="flex h-full">
                  {/* Simulated pie chart */}
                  <div className="relative flex-1 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-48 w-48 rounded-full border-8 border-primary opacity-20"></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="h-48 w-48 rounded-full border-8 border-transparent border-t-primary border-r-primary border-b-primary"
                        style={{ transform: "rotate(45deg)" }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="h-40 w-40 rounded-full border-8 border-transparent border-t-secondary border-r-secondary"
                        style={{ transform: "rotate(135deg)" }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div
                        className="h-32 w-32 rounded-full border-8 border-transparent border-t-accent border-r-accent border-b-accent"
                        style={{ transform: "rotate(270deg)" }}
                      ></div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-24 w-24 rounded-full bg-background flex items-center justify-center text-sm font-medium">
                        Total
                        <br />
                        $4,250
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="w-1/3 flex flex-col justify-center space-y-4 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-primary rounded-sm"></div>
                      <div className="text-sm">Parts (45%)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-secondary rounded-sm"></div>
                      <div className="text-sm">Tools (25%)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-accent rounded-sm"></div>
                      <div className="text-sm">Facilities (20%)</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 bg-muted rounded-sm"></div>
                      <div className="text-sm">Other (10%)</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Spending Trend</CardTitle>
                <CardDescription>Last 6 months of expenses</CardDescription>
              </CardHeader>
              <CardContent className="px-2">
                <div className="h-64">
                  {/* Simulated bar chart */}
                  <div className="flex h-48 items-end justify-between gap-2 pt-6">
                    {[35, 45, 30, 65, 85, 70].map((value, i) => (
                      <div key={i} className="flex flex-col items-center gap-2">
                        <div
                          className="w-12 bg-primary rounded-t-sm"
                          style={{ height: `${value}%`, opacity: 0.7 + i * 0.05 }}
                        ></div>
                        <div className="text-xs">{["Mar", "Apr", "May", "Jun", "Jul", "Aug"][i]}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Vendors</CardTitle>
                <CardDescription>Where you spend the most</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: "Auto Parts Store", amount: "$1,250.75", percentage: 75 },
                    { name: "Tool Warehouse", amount: "$850.50", percentage: 60 },
                    { name: "Paint Supplies", amount: "$650.25", percentage: 45 },
                    { name: "Workshop Rental", amount: "$800.00", percentage: 55 },
                  ].map((vendor, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{vendor.name}</span>
                        <span className="font-medium">{vendor.amount}</span>
                      </div>
                      <Progress value={vendor.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

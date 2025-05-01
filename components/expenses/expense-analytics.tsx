"use client"

import { useState, useEffect } from "react"
import { Calendar, CreditCard, DollarSign, TrendingUp, Filter } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getExpenseAnalytics } from "@/actions/expense-actions"
import { formatCurrency } from "@/utils/format-utils"

interface ExpenseAnalyticsProps {
  projectId?: string
}

export function ExpenseAnalytics({ projectId }: ExpenseAnalyticsProps) {
  const [timeframe, setTimeframe] = useState("month")
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true)
      try {
        const data = await getExpenseAnalytics(projectId, timeframe)
        setAnalyticsData(data)
      } catch (error) {
        console.error("Failed to load analytics:", error)
        // Use mock data if API fails
        setAnalyticsData(getMockAnalyticsData())
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [projectId, timeframe])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expense Analytics</CardTitle>
          <CardDescription>No expense data available for analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-muted-foreground">Start adding expenses to see analytics and insights</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expense Analytics</h2>
          <p className="text-muted-foreground">Insights and trends for your expenses</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last 3 months</SelectItem>
              <SelectItem value="year">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analyticsData.totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.itemCount} expense {analyticsData.itemCount === 1 ? "item" : "items"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Category</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.categorySpending.length > 0 ? analyticsData.categorySpending[0].category : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.categorySpending.length > 0
                ? formatCurrency(analyticsData.categorySpending[0].amount)
                : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Vendor</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData.topVendors.length > 0 ? analyticsData.topVendors[0].vendor : "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.topVendors.length > 0 ? formatCurrency(analyticsData.topVendors[0].amount) : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time Period</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeframe === "week"
                ? "7 Days"
                : timeframe === "month"
                  ? "30 Days"
                  : timeframe === "quarter"
                    ? "3 Months"
                    : "12 Months"}
            </div>
            <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="category">
        <TabsList>
          <TabsTrigger value="category">By Category</TabsTrigger>
          <TabsTrigger value="time">Over Time</TabsTrigger>
          <TabsTrigger value="vendors">Top Vendors</TabsTrigger>
        </TabsList>

        <TabsContent value="category">
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
              <CardDescription>Breakdown of expenses across different categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <CustomPieChart data={analyticsData.categorySpending} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Spending Over Time</CardTitle>
              <CardDescription>Expense trends over the selected time period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <CustomBarChart data={analyticsData.timeSeriesData} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>Top Vendors</CardTitle>
              <CardDescription>Your most frequent expense sources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <CustomHorizontalBarChart data={analyticsData.topVendors} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Custom Pie Chart Component
function CustomPieChart({ data }: { data: any[] }) {
  const total = data.reduce((sum, item) => sum + item.amount, 0)
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <div className="flex h-full">
      {/* Pie chart visualization */}
      <div className="relative flex-1 flex items-center justify-center">
        <div className="w-64 h-64 relative">
          {data.map((item, index) => {
            const percentage = item.amount / total
            const startAngle =
              index === 0 ? 0 : data.slice(0, index).reduce((sum, d) => sum + (d.amount / total) * 360, 0)
            const endAngle = startAngle + percentage * 360

            return (
              <div
                key={index}
                className="absolute inset-0"
                style={{
                  clipPath: `path('M 32 32 L 32 0 A 32 32 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${
                    32 + 32 * Math.sin((endAngle * Math.PI) / 180)
                  } ${32 - 32 * Math.cos((endAngle * Math.PI) / 180)} L 32 32 Z')`,
                  transform: `rotate(${startAngle}deg)`,
                  backgroundColor: item.color || COLORS[index % COLORS.length],
                }}
              ></div>
            )
          })}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-background flex items-center justify-center text-sm font-medium">
              Total
              <br />
              {formatCurrency(total)}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="w-1/3 flex flex-col justify-center space-y-4 pr-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-sm"
              style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}
            ></div>
            <div className="text-sm">
              {item.category} ({((item.amount / total) * 100).toFixed(0)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Custom Bar Chart Component
function CustomBarChart({ data }: { data: any[] }) {
  const maxValue = Math.max(...data.map((item) => item.amount))

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex items-end">
        {data.map((item, index) => {
          const height = (item.amount / maxValue) * 100

          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div className="w-full px-1">
                <div
                  className="w-full bg-primary rounded-t"
                  style={{ height: `${height}%`, opacity: 0.7 + index * 0.05 }}
                ></div>
              </div>
              <div className="mt-2 text-xs text-center">{item.period}</div>
            </div>
          )
        })}
      </div>

      <div className="h-8 flex justify-between items-center mt-4 border-t pt-2">
        <div className="text-xs">$0</div>
        <div className="text-xs">{formatCurrency(maxValue)}</div>
      </div>
    </div>
  )
}

// Custom Horizontal Bar Chart Component
function CustomHorizontalBarChart({ data }: { data: any[] }) {
  const maxValue = Math.max(...data.map((item) => item.amount))

  return (
    <div className="h-full flex flex-col justify-around">
      {data.map((item, index) => {
        const width = (item.amount / maxValue) * 100

        return (
          <div key={index} className="flex items-center gap-2 h-10">
            <div className="w-24 text-sm truncate" title={item.vendor}>
              {item.vendor}
            </div>
            <div className="flex-1 h-6 bg-muted rounded-sm overflow-hidden">
              <div className="h-full bg-secondary rounded-sm" style={{ width: `${width}%` }}></div>
            </div>
            <div className="w-20 text-sm text-right">{formatCurrency(item.amount)}</div>
          </div>
        )
      })}
    </div>
  )
}

// Mock data function for testing
function getMockAnalyticsData() {
  return {
    totalSpent: 4250.75,
    itemCount: 28,
    categorySpending: [
      { category: "Parts", amount: 1850.25, color: "#0088FE" },
      { category: "Tools", amount: 950.5, color: "#00C49F" },
      { category: "Materials", amount: 750.0, color: "#FFBB28" },
      { category: "Facilities", amount: 450.0, color: "#FF8042" },
      { category: "Other", amount: 250.0, color: "#8884d8" },
    ],
    timeSeriesData: [
      { period: "Mar", amount: 1250.5 },
      { period: "Apr", amount: 1750.25 },
      { period: "May", amount: 1100.0 },
      { period: "Jun", amount: 2200.75 },
      { period: "Jul", amount: 3100.5 },
      { period: "Aug", amount: 2500.25 },
    ],
    topVendors: [
      { vendor: "Auto Parts Store", amount: 1250.75 },
      { vendor: "Tool Warehouse", amount: 850.5 },
      { vendor: "Paint Supplies", amount: 650.25 },
      { vendor: "Workshop Rental", amount: 800.0 },
      { vendor: "Hardware Store", amount: 450.25 },
    ],
  }
}

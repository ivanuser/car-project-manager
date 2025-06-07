"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertTriangle, Wrench } from "lucide-react"

interface TestResult {
  test: string
  status: "success" | "error" | "missing"
  details?: string
  error?: string
  columns?: string[]
}

interface TestResponse {
  success: boolean
  message: string
  tests: TestResult[]
  timestamp: string
}

export default function TestMaintenancePage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<TestResponse | null>(null)

  const runTests = async () => {
    setTesting(true)
    setResults(null)

    try {
      const response = await fetch("/api/test-maintenance-db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error("Error running tests:", error)
      setResults({
        success: false,
        message: "Failed to run tests",
        tests: [{
          test: "API Connection",
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error"
        }],
        timestamp: new Date().toISOString()
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "missing":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Success</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "missing":
        return <Badge className="bg-yellow-100 text-yellow-800">Missing</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Test Maintenance Database</h2>
        <p className="text-muted-foreground">
          Run comprehensive tests to ensure the maintenance system is properly configured
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance System Tests
          </CardTitle>
          <CardDescription>
            This will test the maintenance database tables, functions, and basic functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={runTests} disabled={testing} size="lg">
              {testing ? "Running Tests..." : "Run Maintenance Tests"}
            </Button>

            {results && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {results.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <h3 className="text-lg font-medium">{results.message}</h3>
                </div>

                <div className="grid gap-4 md:grid-cols-1">
                  {results.tests.map((test, index) => (
                    <Card key={index} className="border-l-4 border-l-primary">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(test.status)}
                            <h4 className="font-medium">{test.test}</h4>
                          </div>
                          {getStatusBadge(test.status)}
                        </div>

                        {test.details && (
                          <p className="text-sm text-muted-foreground mb-2">{test.details}</p>
                        )}

                        {test.error && (
                          <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                            <p className="text-sm text-red-700">Error: {test.error}</p>
                          </div>
                        )}

                        {test.columns && test.columns.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Table Columns:</p>
                            <div className="flex flex-wrap gap-1">
                              {test.columns.map((column, colIndex) => (
                                <Badge key={colIndex} variant="outline" className="text-xs">
                                  {column}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="text-xs text-muted-foreground">
                  Test completed at: {new Date(results.timestamp).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>What This Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Maintenance schedules table structure and columns</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Maintenance logs table structure and columns</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Maintenance notifications table structure and columns</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Database functions for status updates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span>Basic query functionality</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Database, Wrench } from "lucide-react"

export default function FixMaintenanceSchemaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const fixMaintenanceSchema = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/fix-maintenance-schema", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.error || "Failed to fix maintenance schema")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="text-center">
          <Database className="mx-auto h-12 w-12 text-blue-500" />
          <h1 className="mt-4 text-3xl font-bold">Fix Maintenance Schema</h1>
          <p className="mt-2 text-muted-foreground">
            Initialize the maintenance tracking system for your vehicle projects
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Maintenance System Setup
            </CardTitle>
            <CardDescription>
              This will create the necessary database tables and structures for the maintenance tracking system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium">What this will do:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Create maintenance_schedules table for tracking service intervals</li>
                <li>• Create maintenance_logs table for recording completed maintenance</li>
                <li>• Create maintenance_notifications table for due maintenance alerts</li>
                <li>• Add proper indexes and constraints for optimal performance</li>
                <li>• Set up triggers for automatic status updates</li>
              </ul>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    <p className="font-medium">Maintenance schema fixed successfully!</p>
                    <p>Tables created: {result.details.tablesCreated}</p>
                    <p>Vehicle projects found: {result.details.projectCount}</p>
                    {result.details.existingTables.length > 0 && (
                      <p>Existing tables: {result.details.existingTables.join(", ")}</p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center">
              <Button
                onClick={fixMaintenanceSchema}
                disabled={isLoading}
                size="lg"
                className="w-full sm:w-auto"
              >
                {isLoading ? "Creating Tables..." : "Fix Maintenance Schema"}
              </Button>
            </div>

            {result && (
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Schema fix completed! You can now use the maintenance features.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" asChild>
                    <a href="/dashboard/maintenance">Go to Maintenance Dashboard</a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="/dashboard/projects">View Projects</a>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              If you encounter any issues with the maintenance schema setup:
            </p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Make sure PostgreSQL is running and accessible</li>
              <li>• Verify that your vehicle projects are set up correctly</li>
              <li>• Check that your database user has CREATE TABLE permissions</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

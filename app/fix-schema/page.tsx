'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Database, CheckCircle } from 'lucide-react'

export default function SchemaFixPage() {
  const handleFix = async () => {
    try {
      const response = await fetch('/api/fix-vehicle-projects-schema', {
        method: 'GET',
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert('✅ Schema fixed successfully! You can now create projects.')
        window.location.href = '/dashboard/projects'
      } else {
        alert('❌ Schema fix failed: ' + result.error)
      }
    } catch (error) {
      alert('❌ Error running schema fix: ' + error)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Database Schema Fix</h1>
          <p className="text-muted-foreground">
            Fix the vehicle_projects table schema to include all required columns.
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Issue Detected:</strong> The vehicle_projects table is missing required columns (vin, project_type, start_date, end_date, budget). 
            This prevents project creation from working properly.
          </AlertDescription>
        </Alert>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Schema Fix Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                This fix will add the following columns to the vehicle_projects table:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li><code className="bg-muted px-1 rounded">vin</code> - Vehicle Identification Number</li>
                <li><code className="bg-muted px-1 rounded">project_type</code> - Type of project (restoration, modification, etc.)</li>
                <li><code className="bg-muted px-1 rounded">start_date</code> - Project start date</li>
                <li><code className="bg-muted px-1 rounded">end_date</code> - Project end date</li>
                <li><code className="bg-muted px-1 rounded">budget</code> - Project budget</li>
                <li><code className="bg-muted px-1 rounded">build_stage</code> - Current build stage</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Button 
            onClick={handleFix}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            size="lg"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Fix Database Schema Now
          </Button>
          
          <div className="flex justify-center">
            <Link href="/dashboard/projects">
              <Button variant="outline">
                ← Back to Projects
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

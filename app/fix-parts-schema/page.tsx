"use client"

import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Play, Loader2, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface SchemaStatus {
  needsFix: boolean
  currentSchema: Record<string, boolean>
  allColumns: Array<{
    column_name: string
    data_type: string
    is_nullable: string
    column_default: string | null
  }>
}

export default function FixPartsSchemaPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [schemaStatus, setSchemaStatus] = useState<SchemaStatus | null>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)

  // Check current schema status on load
  useEffect(() => {
    checkSchemaStatus()
  }, [])

  const checkSchemaStatus = async () => {
    setCheckingStatus(true)
    try {
      const response = await fetch('/api/fix-parts-schema')
      const data = await response.json()
      
      if (data.success) {
        setSchemaStatus(data)
      } else {
        console.error('Error checking schema status:', data.error)
      }
    } catch (error) {
      console.error('Error checking schema status:', error)
    } finally {
      setCheckingStatus(false)
    }
  }

  const runFix = async () => {
    setIsLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/fix-parts-schema', {
        method: 'POST',
      })
      
      const data = await response.json()
      setResult(data)
      
      // Refresh schema status after fix
      if (data.success) {
        await checkSchemaStatus()
      }
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error: ' + (error as Error).message
      })
    } finally {
      setIsLoading(false)
    }
  }

  const requiredColumns = ['part_number', 'image_url', 'condition', 'location', 'vendor_id', 'notes']
  const vendorsTableMissing = !schemaStatus?.vendorsTableExists
  const missingColumns = requiredColumns.filter(col => 
    !schemaStatus?.currentSchema[col]
  )

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Package className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold">Fix Parts Schema</h1>
          </div>
          <p className="text-muted-foreground">
            Update the project_parts table schema and create vendors table for complete parts management functionality.
          </p>
        </div>

        {/* Current Schema Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Current Schema Status
            </CardTitle>
            <CardDescription>
              Checking the current project_parts table schema...
            </CardDescription>
          </CardHeader>
          <CardContent>
            {checkingStatus ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking schema status...</span>
              </div>
            ) : schemaStatus ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {schemaStatus.needsFix ? (
                    <>
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      <span className="font-medium">Schema Update Required</span>
                      <Badge variant="outline" className="text-yellow-600">
                        {vendorsTableMissing && missingColumns.length > 0 ? 'Missing Table & Columns' :
                         vendorsTableMissing ? 'Missing Vendors Table' :
                         missingColumns.length > 0 ? 'Missing Columns' : 'Update Required'}
                      </Badge>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-medium">Schema Up to Date</span>
                      <Badge variant="outline" className="text-green-600">
                        All Components Present
                      </Badge>
                    </>
                  )}
                </div>

                {/* Table and Column Status */}
                <div className="space-y-4">
                  {/* Vendors Table Status */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-800">Vendors Table</span>
                      {schemaStatus.vendorsTableExists ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-blue-700">Required for vendor/supplier relationships</p>
                  </div>
                  
                  {/* Parts Table Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {requiredColumns.map(column => (
                      <div key={column} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <span className="font-medium">{column.replace('_', ' ')}</span>
                        {schemaStatus.currentSchema[column] ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {(vendorsTableMissing || missingColumns.length > 0) && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Missing Components:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {vendorsTableMissing && (
                        <li>• Vendors table (for supplier management)</li>
                      )}
                      {missingColumns.map(column => (
                        <li key={column}>• {column.replace('_', ' ')} column</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                Unable to check schema status
              </div>
            )}
          </CardContent>
        </Card>

        {/* What This Fix Does */}
        <Card>
          <CardHeader>
            <CardTitle>What This Fix Does</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Creates vendors table</p>
                  <p className="text-sm text-muted-foreground">
                    Enables supplier/vendor management with contact information and notes
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Adds part identification fields</p>
                  <p className="text-sm text-muted-foreground">
                    Part numbers, condition tracking, and physical location storage
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Enables part image storage</p>
                  <p className="text-sm text-muted-foreground">
                    Upload and display part photos with file system integration
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Adds vendor relationships</p>
                  <p className="text-sm text-muted-foreground">
                    Link parts to vendors for better supply chain management
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Improves search and filtering</p>
                  <p className="text-sm text-muted-foreground">
                    Performance indexes for fast filtering by status, condition, and location
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="font-medium">Adds notes and documentation</p>
                  <p className="text-sm text-muted-foreground">
                    Store additional information, installation notes, and specifications
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Run Fix */}
        {schemaStatus?.needsFix && (
          <Card>
            <CardHeader>
              <CardTitle>Run Schema Fix</CardTitle>
              <CardDescription>
                Click the button below to update your database schema. This operation is safe and will not affect existing data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={runFix} 
                disabled={isLoading}
                size="lg"
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Updating Schema...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Update Project Parts Schema
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500" />
                )}
                Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">Success!</h4>
                    <p className="text-green-700">{result.message}</p>
                  </div>
                  
                  {result.details && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h5 className="font-medium mb-2">Tables Created:</h5>
                        <ul className="space-y-1">
                          {result.details.vendorsTableCreated && (
                            <li className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              Vendors table
                            </li>
                          )}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Columns Added:</h5>
                        <ul className="space-y-1">
                          {result.details.columnsAdded?.map((col: string) => (
                            <li key={col} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {col.replace('_', ' ')}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Enhancements:</h5>
                        <ul className="space-y-1">
                          {result.details.constraintsAdded?.map((constraint: string) => (
                            <li key={constraint} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {constraint}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Button 
                      onClick={() => window.location.href = '/dashboard/parts'}
                      variant="outline"
                    >
                      Go to Parts
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">Error</h4>
                  <p className="text-red-700">{result.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => window.location.href = '/dashboard'}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}

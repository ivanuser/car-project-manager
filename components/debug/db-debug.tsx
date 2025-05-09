"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, CheckCircle2, Database, RefreshCw, Loader2 } from "lucide-react"

export function DatabaseDebug() {
  const [dbInfo, setDbInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [createTableLoading, setCreateTableLoading] = useState(false)
  const [createTableResult, setCreateTableResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const checkDatabase = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/debug/db-schema')
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setDbInfo(data)
    } catch (err) {
      console.error('Error checking database:', err)
      setError((err as Error).message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }
  
  const createTables = async () => {
    setCreateTableLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/debug/create-tables', {
        method: 'POST',
      })
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setCreateTableResult(data)
      
      // Refresh database info
      await checkDatabase()
    } catch (err) {
      console.error('Error creating tables:', err)
      setError((err as Error).message || 'Unknown error')
    } finally {
      setCreateTableLoading(false)
    }
  }
  
  // Load database info on initial render
  useEffect(() => {
    checkDatabase()
  }, [])

  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gray-50 dark:bg-gray-800">
        <CardTitle className="flex items-center text-lg">
          <Database className="w-5 h-5 mr-2 text-primary" />
          Database Status
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4">
        {error && (
          <Alert className="mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="text-red-800 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {createTableResult && (
          <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-300">
              {createTableResult.message}
              {createTableResult.tables && createTableResult.tables.length > 0 && (
                <span className="block mt-1">
                  Created tables: {createTableResult.tables.join(', ')}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Checking database...</span>
          </div>
        ) : dbInfo ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-md font-medium">Database Tables</h3>
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded">
                {/* user_preferences table */}
                <div className="mb-3">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${dbInfo.tableExists ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="font-mono text-sm">user_preferences</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${dbInfo.tableExists ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                      {dbInfo.tableExists ? 'Exists' : 'Missing'}
                    </span>
                  </div>
                  
                  {dbInfo.data && (
                    <div className="mt-2 ml-5 text-xs">
                      <div className="mb-1">Records: {dbInfo.data.count}</div>
                      {dbInfo.data.ids.length > 0 && (
                        <div>
                          <div className="mb-1">IDs:</div>
                          <ul className="ml-4 list-disc">
                            {dbInfo.data.ids.map((id: string, index: number) => (
                              <li key={id} className="font-mono text-xs truncate">
                                {id}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Schema */}
                {dbInfo.schema && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Table Schema</h4>
                    <div className="max-h-48 overflow-y-auto">
                      <table className="min-w-full text-xs">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                          <tr>
                            <th className="px-2 py-1 text-left">Column</th>
                            <th className="px-2 py-1 text-left">Type</th>
                            <th className="px-2 py-1 text-left">Nullable</th>
                          </tr>
                        </thead>
                        <tbody>
                          {dbInfo.schema.map((column: any, index: number) => (
                            <tr key={column.column_name} className={index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}>
                              <td className="px-2 py-1 font-mono">{column.column_name}</td>
                              <td className="px-2 py-1">{column.data_type}</td>
                              <td className="px-2 py-1">{column.is_nullable === 'YES' ? 'Yes' : 'No'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                
                {/* SQL for create table */}
                {dbInfo.createTableSQL && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Create Table SQL</h4>
                    <pre className="p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto text-xs">
                      {dbInfo.createTableSQL}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            Click "Check Database" to view database status
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between gap-2 border-t pt-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={checkDatabase}
          disabled={loading}
          className="flex-1"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-1" />
              Check Database
            </>
          )}
        </Button>
        
        {dbInfo && !dbInfo.tableExists && (
          <Button 
            variant="default" 
            size="sm"
            onClick={createTables}
            disabled={createTableLoading}
            className="flex-1"
          >
            {createTableLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-1" />
                Create Tables
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

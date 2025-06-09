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
      console.log("Checking database status...");
      
      // Check table existence
      const response = await fetch('/api/debug/db-schema')
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("Database info received:", data);
      
      // Extract user_preferences table info
      const userPrefsExists = data.tables?.details?.user_preferences?.exists || 
                             data.tables?.list?.includes('user_preferences') || false;
      
      const profilesExists = data.tables?.details?.profiles?.exists || 
                           data.tables?.list?.includes('profiles') || false;
      
      // Get specific table data
      let userPrefsData = null;
      let profilesData = null;
      
      if (userPrefsExists) {
        try {
          const prefsResponse = await fetch('/api/user/preferences?debug=true');
          if (prefsResponse.ok) {
            userPrefsData = await prefsResponse.json();
          }
        } catch (e) {
          console.log("Could not fetch preferences data:", e);
        }
      }
      
      if (profilesExists) {
        try {
          const profileResponse = await fetch('/api/user/profile?debug=true');
          if (profileResponse.ok) {
            profilesData = await profileResponse.json();
          }
        } catch (e) {
          console.log("Could not fetch profile data:", e);
        }
      }
      
      setDbInfo({
        ...data,
        tableStatus: {
          user_preferences: {
            exists: userPrefsExists,
            data: userPrefsData,
            columns: data.tables?.details?.user_preferences?.columns || []
          },
          profiles: {
            exists: profilesExists,
            data: profilesData,
            columns: data.tables?.details?.profiles?.columns || []
          }
        }
      });
      
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
    setCreateTableResult(null)
    
    try {
      console.log("Creating tables...");
      const response = await fetch('/api/debug/create-tables', {
        method: 'POST',
      })
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server returned ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log("Table creation result:", data);
      setCreateTableResult(data)
      
      // Refresh database info after a short delay
      setTimeout(() => {
        checkDatabase()
      }, 1000);
      
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

  const hasAllTables = dbInfo?.tableStatus?.user_preferences?.exists && 
                      dbInfo?.tableStatus?.profiles?.exists;

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
                    <span className={`w-3 h-3 rounded-full mr-2 ${dbInfo.tableStatus?.user_preferences?.exists ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="font-mono text-sm">user_preferences</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${dbInfo.tableStatus?.user_preferences?.exists ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                      {dbInfo.tableStatus?.user_preferences?.exists ? 'Exists' : 'Missing'}
                    </span>
                  </div>
                  
                  {dbInfo.tableStatus?.user_preferences?.columns?.length > 0 && (
                    <div className="mt-2 ml-5 text-xs">
                      <div className="mb-1">Columns: {dbInfo.tableStatus.user_preferences.columns.map((col: any) => col.column_name).join(', ')}</div>
                    </div>
                  )}
                </div>
                
                {/* profiles table */}
                <div className="mb-3">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${dbInfo.tableStatus?.profiles?.exists ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    <span className="font-mono text-sm">profiles</span>
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${dbInfo.tableStatus?.profiles?.exists ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                      {dbInfo.tableStatus?.profiles?.exists ? 'Exists' : 'Missing'}
                    </span>
                  </div>
                  
                  {dbInfo.tableStatus?.profiles?.columns?.length > 0 && (
                    <div className="mt-2 ml-5 text-xs">
                      <div className="mb-1">Columns: {dbInfo.tableStatus.profiles.columns.map((col: any) => col.column_name).join(', ')}</div>
                    </div>
                  )}
                </div>
                
                {/* Overall Status */}
                <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center">
                    <span className={`w-3 h-3 rounded-full mr-2 ${hasAllTables ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                    <span className="text-sm font-medium">
                      {hasAllTables ? 'All required tables exist' : 'Some tables are missing'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Debug Info */}
            {dbInfo.issues && dbInfo.issues.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2 text-yellow-600">Issues Found:</h4>
                <ul className="text-xs text-yellow-800 dark:text-yellow-300 ml-4 list-disc">
                  {dbInfo.issues.map((issue: string, index: number) => (
                    <li key={index}>{issue}</li>
                  ))}
                </ul>
              </div>
            )}
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
        
        {dbInfo && !hasAllTables && (
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

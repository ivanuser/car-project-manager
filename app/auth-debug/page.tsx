'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"

interface DebugStatus {
  database: {
    connected: boolean
    initialized: boolean
    error?: string
  }
  auth: {
    cookieFound: boolean
    userAuthenticated: boolean
    error?: string
  }
  api: {
    loginEndpoint: boolean
    registerEndpoint: boolean
    userEndpoint: boolean
  }
}

export default function AuthDebugPage() {
  const [status, setStatus] = useState<DebugStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const checkStatus = async () => {
    setLoading(true)
    const newStatus: DebugStatus = {
      database: { connected: false, initialized: false },
      auth: { cookieFound: false, userAuthenticated: false },
      api: { loginEndpoint: false, registerEndpoint: false, userEndpoint: false }
    }

    try {
      // Check database status
      const dbResponse = await fetch('/api/debug/db-schema')
      if (dbResponse.ok) {
        const dbData = await dbResponse.json()
        newStatus.database.connected = dbData.database?.connected || false
        newStatus.database.initialized = dbData.tables?.total > 0 || false
      } else {
        newStatus.database.error = `Database check failed: ${dbResponse.status}`
      }
    } catch (error) {
      newStatus.database.error = error instanceof Error ? error.message : 'Database check failed'
    }

    // Check authentication
    try {
      const cookies = document.cookie.split(';').map(c => c.trim())
      newStatus.auth.cookieFound = cookies.some(c => c.startsWith('cajpro_auth_token='))
      
      const authResponse = await fetch('/api/auth/user')
      if (authResponse.ok) {
        newStatus.auth.userAuthenticated = true
      } else {
        newStatus.auth.error = `Auth check failed: ${authResponse.status}`
      }
    } catch (error) {
      newStatus.auth.error = error instanceof Error ? error.message : 'Auth check failed'
    }

    // Check API endpoints
    try {
      const endpoints = [
        { key: 'loginEndpoint', url: '/api/auth/login' },
        { key: 'registerEndpoint', url: '/api/auth/register' },
        { key: 'userEndpoint', url: '/api/auth/user' }
      ]

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint.url, { method: 'HEAD' })
          newStatus.api[endpoint.key as keyof typeof newStatus.api] = response.status !== 404
        } catch {
          newStatus.api[endpoint.key as keyof typeof newStatus.api] = false
        }
      }
    } catch (error) {
      console.error('Error checking API endpoints:', error)
    }

    setStatus(newStatus)
    setLoading(false)
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const StatusIcon = ({ status }: { status: boolean | undefined }) => {
    if (status === undefined) return <Clock className="h-4 w-4 text-gray-400" />
    return status ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Authentication Debug</h1>
        <div className="text-center py-8">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p>Checking system status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Authentication Debug</h1>
        <Button onClick={checkStatus} variant="outline">
          Refresh Status
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Database Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon status={status?.database.connected} />
              Database
            </CardTitle>
            <CardDescription>PostgreSQL connection and schema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Connected</span>
              <Badge variant={status?.database.connected ? "default" : "destructive"}>
                {status?.database.connected ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Initialized</span>
              <Badge variant={status?.database.initialized ? "default" : "destructive"}>
                {status?.database.initialized ? "Yes" : "No"}
              </Badge>
            </div>
            {status?.database.error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {status.database.error}
              </div>
            )}
            {!status?.database.initialized && (
              <Button 
                onClick={() => window.open('/api/init-db', '_blank')} 
                size="sm" 
                className="w-full"
              >
                Initialize Database
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Authentication Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon status={status?.auth.userAuthenticated} />
              Authentication
            </CardTitle>
            <CardDescription>Session and cookie status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Cookie Found</span>
              <Badge variant={status?.auth.cookieFound ? "default" : "destructive"}>
                {status?.auth.cookieFound ? "Yes" : "No"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Authenticated</span>
              <Badge variant={status?.auth.userAuthenticated ? "default" : "destructive"}>
                {status?.auth.userAuthenticated ? "Yes" : "No"}
              </Badge>
            </div>
            {status?.auth.error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                {status.auth.error}
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={() => window.location.href = '/login'} 
                size="sm" 
                className="flex-1"
              >
                Login
              </Button>
              <Button 
                onClick={() => window.location.href = '/register'} 
                size="sm" 
                variant="outline"
                className="flex-1"
              >
                Register
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Endpoints */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon status={status?.api.loginEndpoint && status?.api.registerEndpoint} />
              API Endpoints
            </CardTitle>
            <CardDescription>Authentication API availability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span>Login</span>
              <Badge variant={status?.api.loginEndpoint ? "default" : "destructive"}>
                {status?.api.loginEndpoint ? "Available" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Register</span>
              <Badge variant={status?.api.registerEndpoint ? "default" : "destructive"}>
                {status?.api.registerEndpoint ? "Available" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>User Info</span>
              <Badge variant={status?.api.userEndpoint ? "default" : "destructive"}>
                {status?.api.userEndpoint ? "Available" : "Missing"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Useful links for debugging</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              onClick={() => window.open('/api/debug/db-schema', '_blank')} 
              variant="outline"
              size="sm"
            >
              Database Debug
            </Button>
            <Button 
              onClick={() => window.open('/api/init-db', '_blank')} 
              variant="outline"
              size="sm"
            >
              Init Database
            </Button>
            <Button 
              onClick={() => window.location.href = '/login'} 
              variant="outline"
              size="sm"
            >
              Login Page
            </Button>
            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              variant="outline"
              size="sm"
            >
              Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(status?.database.connected && status?.database.initialized && status?.api.loginEndpoint) ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {status?.database.connected && status?.database.initialized && status?.api.loginEndpoint ? (
            <div className="text-green-600">
              <p className="font-semibold">✅ System is ready!</p>
              <p className="text-sm">Database is connected and initialized, authentication endpoints are available.</p>
            </div>
          ) : (
            <div className="text-yellow-600">
              <p className="font-semibold">⚠️ System needs setup</p>
              <p className="text-sm">Some components need to be configured before the system is ready.</p>
              {!status?.database.connected && <p className="text-sm">• Database connection failed</p>}
              {!status?.database.initialized && <p className="text-sm">• Database needs initialization</p>}
              {!status?.api.loginEndpoint && <p className="text-sm">• Authentication API not available</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

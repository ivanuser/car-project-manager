'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Settings, User, Car, Wrench, Package, Calendar } from "lucide-react"

export default function DirectDashboardPage() {
  const [authSet, setAuthSet] = useState(false)
  const [cookieInfo, setCookieInfo] = useState("")

  useEffect(() => {
    // Automatically set dev authentication
    const setDevAuth = () => {
      try {
        // Set the dev cookie
        document.cookie = 'cajpro_auth_token=dev-token-12345; path=/; max-age=' + (60 * 60 * 24 * 7)
        
        // Set local storage backup
        localStorage.setItem('cajpro_auth_user', JSON.stringify({
          id: 'dev-user-001',
          email: 'dev@cajpro.local',
          isAdmin: true
        }))
        
        setAuthSet(true)
        setCookieInfo(document.cookie)
        
        console.log("Direct dashboard: Auth token set")
      } catch (error) {
        console.error("Error setting auth:", error)
      }
    }
    
    setDevAuth()
  }, [])

  const testDashboardRedirect = () => {
    // Force redirect to regular dashboard
    window.location.href = '/dashboard'
  }

  const clearAllAuth = () => {
    // Clear all authentication
    document.cookie = 'cajpro_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    localStorage.removeItem('cajpro_auth_user')
    sessionStorage.clear()
    setAuthSet(false)
    setCookieInfo("Cleared")
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🚗 CAJ-Pro Dashboard (Direct Access)</h1>
              <p className="text-muted-foreground">Vehicle Project Management System</p>
            </div>
            <div className="flex gap-2">
              <Badge variant={authSet ? "default" : "destructive"}>
                {authSet ? "Auth Set" : "No Auth"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Auth Status */}
        <Alert className="mb-6">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ✅ Direct dashboard access working! Authentication bypass active.
            <br />
            <small>Cookie: {cookieInfo}</small>
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <div className="grid gap-4 mb-6 md:grid-cols-4">
          <Button onClick={testDashboardRedirect} className="h-auto p-4">
            <div className="text-center">
              <Car className="h-6 w-6 mx-auto mb-2" />
              <div>Go to Real Dashboard</div>
            </div>
          </Button>
          
          <Button onClick={() => window.location.href = '/login'} variant="outline" className="h-auto p-4">
            <div className="text-center">
              <User className="h-6 w-6 mx-auto mb-2" />
              <div>Try Login Page</div>
            </div>
          </Button>
          
          <Button onClick={() => window.location.href = '/auth-debug'} variant="outline" className="h-auto p-4">
            <div className="text-center">
              <Settings className="h-6 w-6 mx-auto mb-2" />
              <div>Auth Debug</div>
            </div>
          </Button>
          
          <Button onClick={clearAllAuth} variant="destructive" className="h-auto p-4">
            <div className="text-center">
              <User className="h-6 w-6 mx-auto mb-2" />
              <div>Clear Auth</div>
            </div>
          </Button>
        </div>

        {/* Main Content - Simplified Dashboard */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Projects Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Projects
              </CardTitle>
              <CardDescription>Manage your vehicle projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Active Projects</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href="/dashboard/projects/new">Create Project</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Tasks Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Tasks
              </CardTitle>
              <CardDescription>Track your project tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Pending Tasks</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/tasks">View Tasks</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Parts Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Parts
              </CardTitle>
              <CardDescription>Manage parts inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Parts Tracked</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/parts">View Parts</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Maintenance Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Maintenance
              </CardTitle>
              <CardDescription>Schedule maintenance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <div className="text-2xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Due Soon</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard/maintenance">View Schedule</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* System Status */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Current system information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Authentication:</span>
                  <Badge variant="default">Bypassed (Dev Mode)</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <Badge variant="outline">Connected</Badge>
                </div>
                <div className="flex justify-between">
                  <span>User:</span>
                  <Badge variant="outline">dev@cajpro.local</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Information */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</div>
              <div><strong>Auth Cookie Set:</strong> {authSet ? 'Yes' : 'No'}</div>
              <div><strong>All Cookies:</strong> {cookieInfo || 'None'}</div>
              <div><strong>Local Storage:</strong> {typeof localStorage !== 'undefined' ? (localStorage.getItem('cajpro_auth_user') ? 'Set' : 'Empty') : 'Not available'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

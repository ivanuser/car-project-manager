'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Zap, 
  Shield, 
  Bug, 
  Settings, 
  Car, 
  User, 
  Key,
  Database
} from "lucide-react"

export default function QuickAccessPage() {
  const goTo = (path: string) => {
    window.location.href = path
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">🚗 CAJ-Pro Quick Access</h1>
          <p className="text-muted-foreground">Choose your entry point to the application</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Instant Login */}
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <Zap className="h-5 w-5" />
                Instant Login
                <Badge variant="default" className="bg-green-600">Recommended</Badge>
              </CardTitle>
              <CardDescription>
                Automatic authentication bypass - fastest way in
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => goTo('/instant-login')} className="w-full bg-green-600 hover:bg-green-700">
                Start Instant Login
              </Button>
            </CardContent>
          </Card>

          {/* Direct Dashboard */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Car className="h-5 w-5" />
                Direct Dashboard
              </CardTitle>
              <CardDescription>
                Skip all auth checks - go straight to dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => goTo('/direct-dashboard')} className="w-full bg-blue-600 hover:bg-blue-700">
                Open Dashboard
              </Button>
            </CardContent>
          </Card>

          {/* Regular Login */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Regular Login
              </CardTitle>
              <CardDescription>
                Standard login/registration page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => goTo('/login')} variant="outline" className="w-full">
                Go to Login
              </Button>
            </CardContent>
          </Card>

          {/* Auth Debug */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Auth Debug
              </CardTitle>
              <CardDescription>
                Comprehensive system status and debugging
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => goTo('/auth-debug')} variant="outline" className="w-full">
                Debug System
              </Button>
            </CardContent>
          </Card>

          {/* Test Login */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Test Login
              </CardTitle>
              <CardDescription>
                Simple testing interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => goTo('/test-login')} variant="outline" className="w-full">
                Test Interface
              </Button>
            </CardContent>
          </Card>

          {/* Database Init */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Setup
              </CardTitle>
              <CardDescription>
                Initialize or check database status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => window.open('/api/init-db', '_blank')} variant="outline" className="w-full">
                Check Database
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* API Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>API Quick Actions</CardTitle>
            <CardDescription>Direct API access for testing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-4">
              <Button 
                onClick={() => window.open('/api/auth/dev-login', '_blank')} 
                size="sm" 
                variant="outline"
              >
                Dev Login API
              </Button>
              <Button 
                onClick={() => window.open('/api/auth/user', '_blank')} 
                size="sm" 
                variant="outline"
              >
                User Info API
              </Button>
              <Button 
                onClick={() => window.open('/api/debug/db-schema', '_blank')} 
                size="sm" 
                variant="outline"
              >
                DB Debug API
              </Button>
              <Button 
                onClick={() => window.open('/api/init-db', '_blank')} 
                size="sm" 
                variant="outline"
              >
                Init DB API
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 Quick Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge className="bg-green-600">1</Badge>
              <div>
                <strong>Try Instant Login first</strong> - This automatically sets up authentication and redirects you to the dashboard.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-blue-600">2</Badge>
              <div>
                <strong>If that fails, use Direct Dashboard</strong> - This bypasses all authentication checks.
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Badge className="bg-gray-600">3</Badge>
              <div>
                <strong>For debugging, use Auth Debug</strong> - This shows detailed system status and helps identify issues.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

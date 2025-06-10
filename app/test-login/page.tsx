'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle } from "lucide-react"

export default function TestLoginPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const testDevLogin = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/auth/dev-login', {
        method: 'GET',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setResult({ success: true, message: 'Dev login successful! Cookie should be set.' })
        
        // Try to redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 2000)
      } else {
        setResult({ success: false, message: data.error || 'Dev login failed' })
      }
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseInit = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/init-db')
      const data = await response.json()
      
      if (response.ok) {
        setResult({ success: true, message: 'Database initialized successfully!' })
      } else {
        setResult({ success: false, message: data.error || 'Database initialization failed' })
      }
    } catch (error) {
      setResult({ success: false, message: error instanceof Error ? error.message : 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  const clearCookies = () => {
    // Clear all cookies for this domain
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    })
    setResult({ success: true, message: 'Cookies cleared!' })
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Testing</CardTitle>
          <CardDescription>
            Simple test page to debug authentication issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <Button 
              onClick={testDatabaseInit} 
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              {loading ? 'Testing...' : '1. Initialize Database'}
            </Button>

            <Button 
              onClick={testDevLogin} 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Logging in...' : '2. Test Dev Login'}
            </Button>

            <Button 
              onClick={() => window.location.href = '/dashboard'} 
              variant="outline"
              className="w-full"
            >
              3. Go to Dashboard
            </Button>

            <Button 
              onClick={() => window.location.href = '/login'} 
              variant="outline"
              className="w-full"
            >
              4. Go to Real Login
            </Button>

            <Button 
              onClick={clearCookies} 
              variant="destructive"
              className="w-full"
            >
              Clear All Cookies
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <div className="space-y-1">
              <div>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</div>
              <div>Cookies: {typeof document !== 'undefined' ? document.cookie || 'None' : 'Loading...'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

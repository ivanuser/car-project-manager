'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Loader2 } from "lucide-react"

export default function InstantLoginPage() {
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState("Starting instant login...")

  useEffect(() => {
    const performInstantLogin = async () => {
      try {
        setStep(1)
        setMessage("Clearing old authentication...")
        
        // Clear any existing auth
        document.cookie = 'cajpro_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        localStorage.clear()
        sessionStorage.clear()
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setStep(2)
        setMessage("Setting development authentication...")
        
        // Set dev auth cookie
        document.cookie = 'cajpro_auth_token=dev-token-12345; path=/; max-age=' + (60 * 60 * 24 * 7)
        
        // Set backup auth in localStorage
        localStorage.setItem('cajpro_auth_user', JSON.stringify({
          id: 'dev-user-001',
          email: 'dev@cajpro.local',
          isAdmin: true,
          fullName: 'Development User'
        }))
        
        await new Promise(resolve => setTimeout(resolve, 500))
        
        setStep(3)
        setMessage("Verifying authentication...")
        
        // Test the auth endpoint
        try {
          const response = await fetch('/api/auth/user', {
            credentials: 'include'
          })
          
          if (response.ok) {
            setStep(4)
            setMessage("Authentication successful! Redirecting to dashboard...")
            
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Force redirect to dashboard
            window.location.href = '/dashboard'
          } else {
            setStep(4)
            setMessage("Auth verification failed, but proceeding anyway...")
            
            await new Promise(resolve => setTimeout(resolve, 1000))
            window.location.href = '/direct-dashboard'
          }
        } catch (error) {
          setStep(4)
          setMessage("Network error, redirecting to direct dashboard...")
          
          await new Promise(resolve => setTimeout(resolve, 1000))
          window.location.href = '/direct-dashboard'
        }
        
      } catch (error) {
        console.error("Instant login error:", error)
        setMessage("Error during login, redirecting to backup...")
        
        await new Promise(resolve => setTimeout(resolve, 1000))
        window.location.href = '/direct-dashboard'
      }
    }
    
    performInstantLogin()
  }, [])

  const manualRedirect = (path: string) => {
    window.location.href = path
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">🚀 Instant Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Automatic authentication in progress...
            </AlertDescription>
          </Alert>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {step >= 1 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                )}
              </div>
              <span className={step >= 1 ? "text-green-600" : "text-blue-600"}>
                Clear old auth
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {step >= 2 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : step >= 1 ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <span className={step >= 2 ? "text-green-600" : step >= 1 ? "text-blue-600" : "text-gray-500"}>
                Set dev authentication
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {step >= 3 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : step >= 2 ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <span className={step >= 3 ? "text-green-600" : step >= 2 ? "text-blue-600" : "text-gray-500"}>
                Verify authentication
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                {step >= 4 ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : step >= 3 ? (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                ) : (
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <span className={step >= 4 ? "text-green-600" : step >= 3 ? "text-blue-600" : "text-gray-500"}>
                Redirect to dashboard
              </span>
            </div>
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {message}
          </div>
          
          {step >= 3 && (
            <div className="space-y-2">
              <Button 
                onClick={() => manualRedirect('/dashboard')} 
                className="w-full"
              >
                Go to Dashboard
              </Button>
              <Button 
                onClick={() => manualRedirect('/direct-dashboard')} 
                variant="outline"
                className="w-full"
              >
                Go to Direct Dashboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

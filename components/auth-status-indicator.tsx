"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, ShieldOff, LogOut, RefreshCw } from "lucide-react"
import { checkAuthStatus, forceSignOut } from "@/lib/auth-utils"
import { useRouter } from "next/navigation"

export function AuthStatusIndicator() {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const router = useRouter()

  const checkAuth = async () => {
    try {
      setIsChecking(true)
      console.log('-------- AUTH STATUS CHECK --------')
      console.log('Checking auth status...')
      
      const { authenticated, user, expiresAt } = await checkAuthStatus()
      
      if (authenticated && user) {
        setStatus('authenticated')
        setUserEmail(user.email || null)
        setExpiresAt(expiresAt ? expiresAt.toLocaleString() : null)
        console.log('Successfully authenticated as:', user.email)
        console.log('Session expires at:', expiresAt ? expiresAt.toLocaleString() : 'unknown')
      } else {
        console.log('Not authenticated')
        setStatus('unauthenticated')
        setUserEmail(null)
        setExpiresAt(null)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setStatus('unauthenticated')
      setUserEmail(null)
      setExpiresAt(null)
    } finally {
      setIsChecking(false)
    }
  }
  
  const handleSignOut = async () => {
    try {
      setIsChecking(true)
      console.log('Starting sign-out process...')
      // Use our improved sign-out function
      forceSignOut()
      // The above function will redirect to /api/auth/reset
    } catch (error) {
      console.error('Error signing out:', error)
      // If there's an error, still try to redirect to login
      window.location.href = '/login'
    }
  }

  // Check auth on mount and when navigating
  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <Card className={
      status === 'authenticated' 
        ? "border-green-500 bg-green-50 dark:bg-green-950/20" 
        : status === 'unauthenticated'
          ? "border-red-500 bg-red-50 dark:bg-red-950/20"
          : "border-gray-300"
    }>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          {status === 'loading' && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
          {status === 'authenticated' && <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />}
          {status === 'unauthenticated' && <ShieldOff className="w-5 h-5 mr-2 text-red-500" />}
          Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          {status === 'loading' && <p>Checking authentication status...</p>}
          {status === 'authenticated' && (
            <div>
              <p className="font-medium">Authenticated as: <span className="text-green-600 dark:text-green-400">{userEmail}</span></p>
              {expiresAt && (
                <p className="text-xs text-muted-foreground mt-1">Session expires: {expiresAt}</p>
              )}
              <div className="mt-3 flex justify-between">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={checkAuth} 
                  disabled={isChecking}
                  className="text-xs"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Refresh
                    </>
                  )}
                </Button>
                
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={handleSignOut} 
                  className="text-xs"
                  disabled={isChecking}
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Signing out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-3 h-3 mr-1" />
                      Sign Out
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
          {status === 'unauthenticated' && (
            <div>
              <p className="font-medium text-red-600 dark:text-red-400">Not authenticated</p>
              <div className="mt-3 flex justify-between">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={checkAuth} 
                  disabled={isChecking}
                  className="text-xs"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Check Status
                    </>
                  )}
                </Button>
                
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => window.location.href = '/login'}
                  className="text-xs"
                >
                  Sign In
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

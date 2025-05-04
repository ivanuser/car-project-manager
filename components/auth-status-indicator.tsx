"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, ShieldOff, LogOut, RefreshCw } from "lucide-react"
import { forceSignOut } from "@/lib/auth-utils"
import { useRouter } from "next/navigation"

// Create a simplified version that just looks for cookies
const checkAuthFromCookies = () => {
  if (typeof document === 'undefined') return false;
  
  const cookies = document.cookie.split(';').map(c => c.trim());
  console.log("Available cookies:", cookies);
  
  return cookies.some(c => 
    c.startsWith('sb-') || 
    c.includes('auth-token') || 
    c.includes('access-token')
  );
}

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
      
      // Simplify - just check for cookies
      const hasAuthCookies = checkAuthFromCookies();
      
      // Also check localStorage
      const backupEmail = typeof window !== 'undefined' ? localStorage.getItem('supabase-auth-user-email') : null;
      
      if (hasAuthCookies) {
        console.log('Found auth cookies - user is authenticated');
        setStatus('authenticated');
        
        // Use email from localStorage if available
        if (backupEmail) {
          setUserEmail(backupEmail);
          console.log('Using email from localStorage:', backupEmail);
        } else {
          setUserEmail('authenticated@user.com');
          
          // Save this email to localStorage for future use
          if (typeof window !== 'undefined') {
            localStorage.setItem('supabase-auth-user-email', 'authenticated@user.com');
            localStorage.setItem('supabase-auth-user-id', 'authenticated-user');
          }
        }
      } else {
        console.log('No auth cookies found - user is not authenticated');
        setStatus('unauthenticated');
        setUserEmail(null);
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      
      // Even on error, check for cookies as fallback
      if (checkAuthFromCookies()) {
        setStatus('authenticated');
        setUserEmail('authenticated@user.com');
      } else {
        setStatus('unauthenticated');
        setUserEmail(null);
      }
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

  // Check auth immediately and periodically
  useEffect(() => {
    // Check on initial load
    checkAuth()
    
    // Set up a timer to check every 5 seconds
    const intervalId = setInterval(() => {
      if (!isChecking) {
        checkAuth()
      }
    }, 5000)
    
    return () => clearInterval(intervalId)
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

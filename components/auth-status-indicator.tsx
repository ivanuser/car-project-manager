"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, ShieldOff } from "lucide-react"

export function AuthStatusIndicator() {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [isChecking, setIsChecking] = useState(false)

  const checkAuth = async () => {
    try {
      setIsChecking(true)
      const response = await fetch('/api/auth/debug')
      const data = await response.json()
      
      if (data.user?.exists) {
        setStatus('authenticated')
        setUserEmail(data.user.email)
      } else {
        setStatus('unauthenticated')
        setUserEmail(null)
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
      setStatus('unauthenticated')
    } finally {
      setIsChecking(false)
    }
  }

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
            <p className="font-medium">Authenticated as: <span className="text-green-600 dark:text-green-400">{userEmail}</span></p>
          )}
          {status === 'unauthenticated' && (
            <p className="font-medium text-red-600 dark:text-red-400">Not authenticated</p>
          )}

          <div className="mt-3 flex justify-end">
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
                'Check Status'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

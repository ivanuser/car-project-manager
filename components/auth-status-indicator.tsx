"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ShieldCheck, ShieldOff, LogOut, RefreshCw } from "lucide-react"
import { forceSignOut, checkAuthStatus } from "@/lib/auth-utils"
import { useRouter } from "next/navigation"

export function AuthStatusIndicator() {
  // Start with loading state until we check auth status
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const router = useRouter();

  // Check auth status once when component mounts
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('AuthStatusIndicator: Checking auth status...');
        const result = await checkAuthStatus();
        
        if (result.authenticated && result.user) {
          console.log('AuthStatusIndicator: User is authenticated as', result.user.email);
          setStatus('authenticated');
          setUserEmail(result.user.email);
        } else {
          console.log('AuthStatusIndicator: User is not authenticated');
          setStatus('unauthenticated');
          setUserEmail(null);
        }
      } catch (error) {
        console.error('AuthStatusIndicator: Error checking auth', error);
        setStatus('unauthenticated');
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Simplified sign out function
  const handleSignOut = async () => {
    try {
      setIsChecking(true);
      console.log('Starting sign-out process...');
      forceSignOut();
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/login';
    }
  };

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
          {status === 'authenticated' && <ShieldCheck className="w-5 h-5 mr-2 text-green-500" />}
          {status === 'unauthenticated' && <ShieldOff className="w-5 h-5 mr-2 text-red-500" />}
          Authentication Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          {status === 'authenticated' && (
            <div>
              <p className="font-medium">Authenticated as: <span className="text-green-600 dark:text-green-400">{userEmail}</span></p>
              <div className="mt-3 flex justify-between">
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

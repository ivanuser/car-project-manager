"use client"

import { useEffect, useState } from 'react'
import { useAuth, AuthProvider } from '@/components/auth/client-provider'
import { Header } from '@/components/dashboard/header'

export function AuthLayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ClientLayoutWrapper>
        {children}
      </ClientLayoutWrapper>
    </AuthProvider>
  )
}

function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const [showContent, setShowContent] = useState(false)
  
  // Handle the initial loading state
  useEffect(() => {
    // We always show content after a short delay, authenticated or not
    const timer = setTimeout(() => {
      setShowContent(true)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [isLoading])
  
  if (!showContent) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-lg">Loading...</div>
      </div>
    )
  }
  
  // Pass the client-side authenticated user to the Header component
  return (
    <>
      <Header user={user || undefined} />
      <main className="flex-1 p-4 md:p-6">
        {user ? (
          // Authenticated user - show full content
          children
        ) : (
          // Guest - show content with warning banner
          <div className="space-y-4">
            <div className="p-4 bg-yellow-900 text-yellow-100 rounded-md">
              <h2 className="text-lg font-semibold">Not Authenticated</h2>
              <p>You're currently viewing the dashboard as a guest. Some features may be limited.</p>
              <div className="mt-3">
                <a href="/login" className="underline">Sign in</a> to access all features.
              </div>
            </div>
            {children}
          </div>
        )}
      </main>
    </>
  )
}

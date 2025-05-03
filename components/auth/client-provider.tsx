"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createAuthClient } from '@/lib/client-auth'

// Define types for the auth context
type User = {
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
} | null

type AuthContextType = {
  user: User
  isLoading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  signOut: async () => {},
  refreshUser: async () => {}
})

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to check auth status
  const refreshUser = async () => {
    try {
      const supabase = createAuthClient()
      const { data } = await supabase.auth.getSession()
      
      if (data.session?.user) {
        // Try to get profile data (fullName, avatarUrl)
        try {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', data.session.user.id)
            .single()
            
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || "",
            fullName: profileData?.full_name,
            avatarUrl: profileData?.avatar_url
          })
        } catch (profileError) {
          // If profile fetch fails, still set user with basic info
          setUser({
            id: data.session.user.id,
            email: data.session.user.email || ""
          })
        }
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  // Function to sign out
  const signOut = async () => {
    try {
      const supabase = createAuthClient()
      await supabase.auth.signOut()
      setUser(null)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // Check auth on initial load
  useEffect(() => {
    refreshUser()
    
    // Set up auth state change listener
    const supabase = createAuthClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          refreshUser()
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
      }
    )
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext)

"use client"

import { createAuthClient } from "@/lib/client-auth"

/**
 * Client-side utility to check if a user is authenticated
 * @returns Promise<{ authenticated: boolean, user: any | null }>
 */
export async function checkAuthStatus() {
  try {
    console.log("Checking client-side auth status using simplified method...")
    
    // First, check for cookies directly - this is most reliable
    if (typeof document !== 'undefined') {
      const cookies = document.cookie.split(';').map(c => c.trim())
      console.log("Available cookies:", cookies)
      
      const hasAuthCookie = cookies.some(c => 
        c.startsWith('sb-') || 
        c.includes('auth-token') || 
        c.includes('access-token')
      )
      
      if (hasAuthCookie) {
        console.log("Found auth cookies - user is authenticated")
        
        // Check for backup email in localStorage
        const backupEmail = localStorage.getItem('supabase-auth-user-email')
        const backupId = localStorage.getItem('supabase-auth-user-id')
        
        if (backupEmail) {
          console.log("Using email from localStorage:", backupEmail)
          return {
            authenticated: true,
            user: { email: backupEmail, id: backupId || 'authenticated-user' },
            source: 'cookies+localStorage'
          }
        }
        
        // No localStorage backup, use default values
        const defaultEmail = 'honerivan@gmail.com'
        localStorage.setItem('supabase-auth-user-email', defaultEmail)
        localStorage.setItem('supabase-auth-user-id', 'authenticated-user')
        
        return {
          authenticated: true,
          user: { email: defaultEmail, id: 'authenticated-user' },
          source: 'cookies'
        }
      }
    }
    
    console.log("No authentication indicators found")
    return { authenticated: false, user: null }
  } catch (error) {
    console.error("Error in simplified auth check:", error)
    return { authenticated: false, user: null, error }
  }
}

/**
 * Client-side utility to sign out
 * @returns Promise<{ success: boolean, error?: any }>
 */
export async function signOutClient() {
  try {
    console.log("Signing out client-side...")
    const supabase = createAuthClient()
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error("Error signing out:", error)
      return { success: false, error }
    }
    
    // Clear any backup auth state from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('supabase-auth-user-email')
      localStorage.removeItem('supabase-auth-user-id')
    }
    
    console.log("Client-side sign out successful")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error signing out:", error)
    return { success: false, error }
  }
}

/**
 * Client-side utility to force a hard sign out and redirect to login
 */
export function forceSignOut() {
  // First try regular sign out
  signOutClient().finally(() => {
    // Then perform a hard reset of auth state
    if (typeof window !== 'undefined') {
      // Clear any auth-related items from localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('supabase') || 
          key.includes('sb-') || 
          key.includes('auth') ||
          key.startsWith('next-auth')
        )) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      // Clear our custom auth items
      localStorage.removeItem('supabase-auth-user-email');
      localStorage.removeItem('supabase-auth-user-id');
      
      // Clear session storage
      sessionStorage.clear();
      
      // Redirect to the auth reset page which will clear server-side cookies
      window.location.href = '/api/auth/reset';
    }
  });
}

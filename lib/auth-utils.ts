"use client"

import { createAuthClient } from "@/lib/client-auth"

/**
 * Client-side utility to check if a user is authenticated
 * @returns Promise<{ authenticated: boolean, user: any | null }>
 */
export async function checkAuthStatus() {
  try {
    console.log("Checking client-side auth status...")
    const supabase = createAuthClient()
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error("Error checking auth status:", error)
      return { authenticated: false, user: null, error }
    }
    
    if (data?.session) {
      console.log("Client-side authentication confirmed:", data.session.user.email)
      return { 
        authenticated: true, 
        user: data.session.user,
        expiresAt: data.session.expires_at ? new Date(data.session.expires_at * 1000) : null
      }
    }
    
    console.log("No active session found")
    return { authenticated: false, user: null }
  } catch (error) {
    console.error("Unexpected error checking auth status:", error)
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

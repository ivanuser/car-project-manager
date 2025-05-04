"use client"

import { createAuthClient } from "@/lib/client-auth"

/**
 * Client-side utility to check if a user is authenticated
 * @returns Promise<{ authenticated: boolean, user: any | null }>
 */
export async function checkAuthStatus() {
  try {
    console.log("Checking client-side auth status...")
    
    // Check for backup authentication indicators in localStorage
    const backupEmail = typeof window !== 'undefined' ? localStorage.getItem('supabase-auth-user-email') : null;
    const backupId = typeof window !== 'undefined' ? localStorage.getItem('supabase-auth-user-id') : null;
    
    // Try the standard Supabase auth check
    const supabase = createAuthClient()
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error("Error checking auth status:", error)
      
      // Even if Supabase session check fails, we might have backup auth data
      if (backupEmail && backupId) {
        console.log("Using backup authentication from localStorage:", backupEmail)
        return {
          authenticated: true,
          user: { email: backupEmail, id: backupId },
          expiresAt: null,
          source: 'localStorage'
        }
      }
      
      return { authenticated: false, user: null, error }
    }
    
    if (data?.session) {
      console.log("Client-side authentication confirmed:", data.session.user.email)
      
      // Store backup authentication in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('supabase-auth-user-email', data.session.user.email || '')
        localStorage.setItem('supabase-auth-user-id', data.session.user.id || '')
      }
      
      return { 
        authenticated: true, 
        user: data.session.user,
        expiresAt: data.session.expires_at ? new Date(data.session.expires_at * 1000) : null,
        source: 'supabase'
      }
    }
    
    // If Supabase session check doesn't find a session, check for cookies directly
    const cookies = document.cookie.split(';').map(c => c.trim())
    console.log("Checking cookies:", cookies.filter(c => !c.includes('token')).join(', '))
    
    const hasAuthCookie = cookies.some(c => 
      c.startsWith('sb-') || 
      c.includes('auth-token') || 
      c.includes('access-token')
    )
    
    if (hasAuthCookie) {
      console.log("Found auth cookies, assuming authenticated")
      
      // If we have backup data in localStorage, use that
      if (backupEmail && backupId) {
        return {
          authenticated: true,
          user: { email: backupEmail, id: backupId },
          expiresAt: null,
          source: 'cookies+localStorage'
        }
      }
      
      return {
        authenticated: true,
        user: { email: 'authenticated user', id: 'authenticated' },
        expiresAt: null,
        source: 'cookies'
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

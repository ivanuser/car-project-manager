"use client"

// We're not using this import anymore but keeping it for compatibility
// import { createAuthClient } from "@/lib/client-auth"

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
      
      // Try to parse the session cookie to get the real user email
      const hasAuthCookie = cookies.some(c => c.startsWith('sb-') || c.includes('auth-token'))
      const projectRef = 'dqapklpzcfosobremzfc' // This should be extracted from your SUPABASE_URL
      const authCookie = cookies.find(c => c.startsWith(`sb-${projectRef}-auth-token=`))
      
      let userEmail = null
      let userId = null
      
      if (authCookie) {
        // Try to extract email from the auth cookie
        try {
          const cookieValue = authCookie.split('=')[1]
          const decodedValue = decodeURIComponent(cookieValue)
          const sessionData = JSON.parse(decodedValue)
          
          if (sessionData && sessionData.user) {
            userEmail = sessionData.user.email
            userId = sessionData.user.id
            console.log("Extracted user email from auth cookie:", userEmail)
          }
        } catch (e) {
          console.error("Error parsing auth cookie:", e)
        }
      }
      
      // Fallback to localStorage if cookie parsing failed
      if (!userEmail) {
        userEmail = localStorage.getItem('supabase-auth-user-email')
        userId = localStorage.getItem('supabase-auth-user-id')
        console.log("Using email from localStorage:", userEmail)
      } else {
        // Store the email in localStorage for future use
        localStorage.setItem('supabase-auth-user-email', userEmail)
        localStorage.setItem('supabase-auth-user-id', userId || 'authenticated-user')
      }
      
      if (hasAuthCookie) {
        console.log("Found auth cookies - user is authenticated")
        return {
          authenticated: true,
          user: { 
            email: userEmail || 'authenticated@user.com', 
            id: userId || 'authenticated-user' 
          },
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
    
    // Clear any auth state from localStorage
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

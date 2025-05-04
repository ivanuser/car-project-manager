"use client"

/**
 * Super simplified auth checker that only looks for auth cookies
 */
export async function checkAuthStatus() {
  console.log("Using ultra-simple auth check...")
  
  // Check if running on client
  if (typeof window === 'undefined') {
    return { authenticated: false, user: null };
  }
  
  try {
    // Simply check for Supabase auth cookies - any auth cookie means authenticated
    const cookies = document.cookie.split(';').map(c => c.trim());
    console.log("Available cookies:", cookies);

    // If we have ANY auth-related cookie, we're authenticated
    const hasAuthCookie = cookies.some(c => 
      c.includes('sb-') || 
      c.includes('auth')
    );
    
    if (hasAuthCookie) {
      // Try to get user email from localStorage or use a default
      const email = localStorage.getItem('supabase-auth-user-email') || 
                   localStorage.getItem('auth-user-email') ||
                   'authenticated-user@example.com';
                   
      // Store this email for next time
      localStorage.setItem('auth-user-email', email);
      
      console.log("Auth check: Authenticated as", email);
      
      return {
        authenticated: true,
        user: { email, id: 'authenticated-user' }
      };
    }
    
    console.log("Auth check: No auth cookies found");
    return { authenticated: false, user: null };
  } catch (error) {
    console.error("Error in simple auth check:", error);
    return { authenticated: false, user: null, error };
  }
}

/**
 * Client-side utility to sign out
 */
export async function signOutClient() {
  if (typeof window === 'undefined') return { success: false };
  
  try {
    console.log("Signing out...");
    
    // Clear auth-related items from localStorage
    localStorage.removeItem('auth-user-email');
    localStorage.removeItem('supabase-auth-user-email');
    localStorage.removeItem('supabase-auth-user-id');
    
    return { success: true };
  } catch (error) {
    console.error("Sign out error:", error);
    return { success: false, error };
  }
}

/**
 * Force sign out and redirect to login
 */
export function forceSignOut() {
  signOutClient().finally(() => {
    if (typeof window !== 'undefined') {
      // Clear ALL auth-related localStorage items
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('auth') || key.includes('supabase'))) {
          localStorage.removeItem(key);
        }
      }
      
      // Redirect to the auth reset page
      window.location.href = '/api/auth/reset';
    }
  });
}

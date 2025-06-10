"use client"

/**
 * Check authentication status using the proper API
 */
export async function checkAuthStatus() {
  console.log("Checking authentication status...");
  
  // Check if running on client
  if (typeof window === 'undefined') {
    return { authenticated: false, user: null };
  }
  
  try {
    // Check with the auth API
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log("Auth check: Authenticated as", data.user?.email);
      
      return {
        authenticated: true,
        user: data.user
      };
    } else {
      console.log("Auth check: Not authenticated", response.status);
      return { authenticated: false, user: null };
    }
  } catch (error) {
    console.error("Error in auth check:", error);
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
    
    // Clear any local storage
    localStorage.removeItem('cajpro_auth_user');
    sessionStorage.clear();
    
    // Call the logout API endpoint
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        console.warn('Failed to logout via API, but continuing client-side logout');
      }
    } catch (e) {
      console.warn('Error calling logout API, but continuing client-side logout:', e);
    }
    
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
      window.location.href = '/login';
    }
  });
}

"use client"

/**
 * Check authentication status based on JWT in cookies (Enhanced for debugging)
 */
export async function checkAuthStatus() {
  console.log("Checking authentication status...");
  
  // Check if running on client
  if (typeof window === 'undefined') {
    return { authenticated: false, user: null };
  }
  
  try {
    // Look for our auth token cookie
    const cookies = document.cookie.split(';').map(c => c.trim());
    console.log("Available cookies:", cookies);

    // Find the Cajpro auth token
    const authCookie = cookies.find(c => c.startsWith('cajpro_auth_token='));
    
    if (!authCookie) {
      console.log("Auth check: No auth token found in cookies");
      return { authenticated: false, user: null };
    }
    
    // Extract the token
    const token = authCookie.split('=')[1];
    
    if (!token) {
      console.log("Auth check: Empty auth token");
      return { authenticated: false, user: null };
    }
    
    console.log("Auth check: Found token:", token.substring(0, 10) + "...");
    
    // Check if it's the dev token
    if (token === 'dev-token-12345') {
      console.log("Auth check: Using dev token");
      const devUser = {
        id: 'dev-user-001',
        email: 'dev@cajpro.local',
        isAdmin: true
      };
      
      return {
        authenticated: true,
        user: devUser
      };
    }
    
    // For real tokens, try to validate via API
    try {
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Auth check: API validation successful", data.user?.email);
        
        return {
          authenticated: true,
          user: data.user
        };
      } else {
        console.log("Auth check: API validation failed", response.status);
        return { authenticated: false, user: null };
      }
    } catch (apiError) {
      console.error("Auth check: API error", apiError);
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
    
    // Clear all auth-related items
    localStorage.removeItem('cajpro_auth_user');
    localStorage.removeItem('cajpro_dev_mode');
    sessionStorage.removeItem('cajpro_auth_session');
    
    // Clear cookies
    document.cookie = 'cajpro_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    
    // Try to call the logout API endpoint
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
      // Redirect to login page
      window.location.href = '/login';
    }
  });
}

/**
 * Development helper to set dev token
 */
export function setDevToken() {
  if (typeof document !== 'undefined') {
    document.cookie = 'cajpro_auth_token=dev-token-12345; path=/; max-age=' + (60 * 60 * 24 * 7); // 7 days
    console.log("Dev token set");
  }
}

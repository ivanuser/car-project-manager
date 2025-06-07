"use client"

import jwtUtils from '@/lib/auth/jwt';

/**
 * Check authentication status based on JWT in cookies
 */
export async function checkAuthStatus() {
  console.log("Checking authentication status with JWT...");
  
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
    
    // If not found, check for fallback auth methods
    if (!authCookie) {
      console.log("Auth check: No auth token found in cookies");
      
      // For development, check localStorage for auth info (but don't use dev admin mode)
      const localAuthData = localStorage.getItem('cajpro_auth_user');
      if (localAuthData) {
        try {
          const userData = JSON.parse(localAuthData);
          console.log("Found auth data in localStorage:", userData);
          
          // Only use this if it's not the dev admin user
          if (userData.email !== 'admin@cajpro.local') {
            return {
              authenticated: true,
              user: userData
            };
          }
        } catch (e) {
          console.error("Error parsing local auth data:", e);
        }
      }
      
      // Check session storage for auth info
      const sessionAuthData = sessionStorage.getItem('cajpro_auth_session');
      if (sessionAuthData) {
        try {
          const sessionData = JSON.parse(sessionAuthData);
          console.log("Found auth data in sessionStorage:", sessionData);
          return {
            authenticated: true,
            user: {
              id: sessionData.userId || 'unknown',
              email: sessionData.email || 'user@example.com'
            }
          };
        } catch (e) {
          console.error("Error parsing session auth data:", e);
        }
      }
      
      return { authenticated: false, user: null };
    }
    
    // Extract the token
    const token = authCookie.split('=')[1];
    
    if (!token) {
      console.log("Auth check: Empty auth token");
      return { authenticated: false, user: null };
    }
    
    // Verify the token on client-side
    const payload = jwtUtils.verifyToken(token);
    
    if (!payload || jwtUtils.isTokenExpired(token)) {
      console.log("Auth check: Invalid or expired token");
      return { authenticated: false, user: null };
    }
    
    // Extract user info from payload
    const email = payload.email;
    const userId = payload.sub;
    const isAdmin = payload.isAdmin;
    
    // Store user info in localStorage for backup/persistence
    localStorage.setItem('cajpro_auth_user', JSON.stringify({
      id: userId,
      email,
      isAdmin
    }));
    
    console.log("Auth check: Authenticated as", email);
    
    return {
      authenticated: true,
      user: { 
        email, 
        id: userId,
        isAdmin 
      }
    };
  } catch (error) {
    console.error("Error in auth check:", error);
    return { authenticated: false, user: null, error };
  }
}

/**
 * Enable development admin mode
 * DISABLED - No longer automatically enabling
 */
export function enableDevAdminMode() {
  console.log("Dev admin mode is disabled - use real authentication");
  return false;
}

/**
 * Client-side utility to sign out - calls the logout API
 */
export async function signOutClient() {
  if (typeof window === 'undefined') return { success: false };
  
  try {
    console.log("Signing out...");
    
    // Clear localStorage items
    localStorage.removeItem('cajpro_auth_user');
    localStorage.removeItem('cajpro_dev_mode');
    sessionStorage.removeItem('cajpro_auth_session');
    
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
      // Redirect to login page
      window.location.href = '/login';
    }
  });
}
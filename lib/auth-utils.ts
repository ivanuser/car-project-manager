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
    
    if (!authCookie) {
      console.log("Auth check: No auth token found");
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
 * Client-side utility to sign out - calls the logout API
 */
export async function signOutClient() {
  if (typeof window === 'undefined') return { success: false };
  
  try {
    console.log("Signing out...");
    
    // Call the logout API endpoint
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to logout');
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

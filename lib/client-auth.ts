/**
 * Client-side logout utility
 * Handles logout with proper cache clearing and redirection
 */

export async function clientLogout() {
  try {
    // Call logout API to clear server-side session
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Clear client-side storage
    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear any cached data
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
    }

    // Force redirect to landing page (bypasses any router caching)
    window.location.href = '/';
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    
    // Force redirect even if API call fails
    window.location.href = '/';
    
    return { success: false, error };
  }
}

/**
 * Check if user is authenticated (client-side)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Simple check - real validation happens server-side
  return document.cookie.includes('auth-token=');
}

/**
 * Get auth token from cookies (client-side)
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => 
    cookie.trim().startsWith('auth-token=')
  );
  
  if (authCookie) {
    return authCookie.split('=')[1];
  }
  
  return null;
}

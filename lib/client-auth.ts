/**
 * Comprehensive Client-side Auth Service
 * Handles all authentication operations from the client
 */

export interface User {
  id: string;
  email: string;
  fullName?: string;
  isAdmin?: boolean;
  avatarUrl?: string;
}

export interface AuthSession {
  user: User | null;
  authenticated: boolean;
}

export interface AuthResult {
  user: User;
  token?: string;
  message?: string;
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return {
    user: data.user,
    message: data.message
  };
}

/**
 * Register new user
 */
export async function registerUser(email: string, password: string, confirmPassword: string): Promise<AuthResult> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, confirmPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return {
    user: data.user,
    message: data.message
  };
}

/**
 * Get current session
 */
export async function getSession(): Promise<AuthSession> {
  try {
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return {
        user: data.user,
        authenticated: true
      };
    } else {
      return {
        user: null,
        authenticated: false
      };
    }
  } catch (error) {
    console.error('Error getting session:', error);
    return {
      user: null,
      authenticated: false
    };
  }
}

/**
 * Logout user with proper cache clearing
 */
export async function logoutUser(): Promise<{ success: boolean; redirectUrl: string }> {
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

    return { success: true, redirectUrl: '/' };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: true, redirectUrl: '/' }; // Still redirect even on error
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/auth/password-reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Password reset request failed');
  }

  return {
    success: true,
    message: data.message || 'Password reset instructions sent'
  };
}

/**
 * Reset password with token
 */
export async function resetPassword(token: string, password: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/auth/password-reset/confirm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password, confirmPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Password reset failed');
  }

  return {
    success: true,
    message: data.message || 'Password reset successful'
  };
}

/**
 * Change password
 */
export async function changePassword(currentPassword: string, newPassword: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Password change failed');
  }

  return {
    success: true,
    message: data.message || 'Password changed successfully'
  };
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

/**
 * Enhanced logout specifically for client components
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

// Default export object that provides all the methods
const clientAuth = {
  loginUser,
  registerUser,
  getSession,
  logoutUser,
  requestPasswordReset,
  resetPassword,
  changePassword,
  isAuthenticated,
  getAuthToken,
  clientLogout
};

export default clientAuth;

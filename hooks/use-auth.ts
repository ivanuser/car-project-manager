"use client"

import { useState, useEffect } from 'react';
import { checkAuthStatus } from '@/lib/auth-utils';

export interface AuthUser {
  id: string;
  email: string;
  isAdmin?: boolean;
}

interface UseAuthReturn {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
}

/**
 * Hook to get current authentication status
 * Compatible with both old Supabase and new direct PostgreSQL auth
 */
export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    // Load authentication status from local auth check
    const fetchAuthStatus = async () => {
      setLoading(true);
      try {
        const { authenticated, user: authUser } = await checkAuthStatus();
        
        if (authenticated && authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email,
            isAdmin: authUser.isAdmin
          });
        } else {
          setUser(null);
        }
        
        setError(null);
      } catch (err) {
        console.error('Authentication error:', err);
        setError(err as Error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAuthStatus();
    
    // Set up an interval to periodically check auth status
    const intervalId = setInterval(fetchAuthStatus, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(intervalId);
  }, []);
  
  return {
    user,
    loading,
    error,
    isAuthenticated: !!user
  };
}

export default useAuth;

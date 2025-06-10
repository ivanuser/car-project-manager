/**
 * useAuth.ts - React hook for authentication
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import clientAuth, { User } from '@/lib/client-auth';

// Auth hook result interface
export interface UseAuthResult {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (token: string, password: string, confirmPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => Promise<void>;
}

/**
 * Custom hook for authentication
 */
export const useAuth = (): UseAuthResult => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Refresh session
   */
  const refreshSession = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const session = await clientAuth.getSession();
      setUser(session.user);
      setAuthenticated(session.authenticated);
    } catch (error: any) {
      console.error('Error refreshing session:', error);
      setError(error.message || 'Failed to refresh session');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await clientAuth.loginUser(email, password);
      setUser(result.user);
      setAuthenticated(true);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Register user
   */
  const register = useCallback(async (
    email: string, 
    password: string, 
    confirmPassword: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await clientAuth.registerUser(email, password, confirmPassword);
      setUser(result.user);
      setAuthenticated(true);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const result = await clientAuth.logoutUser();
      setUser(null);
      setAuthenticated(false);
      
      // Navigate to login page using the returned URL or default to /login
      router.push(result.redirectUrl || '/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      setError(error.message || 'Logout failed');
      
      // Still redirect to login on error
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Reset password
   */
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      await clientAuth.requestPasswordReset(email);
      
      // Show success message (could redirect to a confirmation page)
      router.push('/forgot-password/confirmation');
    } catch (error: any) {
      console.error('Password reset request error:', error);
      setError(error.message || 'Password reset request failed');
    } finally {
      setLoading(false);
    }
  }, [router]);

  /**
   * Confirm password reset with token
   */
  const confirmResetPassword = useCallback(
    async (
      token: string,
      password: string,
      confirmPassword: string
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await clientAuth.resetPassword(token, password, confirmPassword);

        // Redirect to login page
        router.push('/login?reset=success');
      } catch (error: any) {
        console.error('Password reset error:', error);
        setError(error.message || 'Password reset failed');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  /**
   * Change password
   */
  const changePassword = useCallback(
    async (
      currentPassword: string,
      newPassword: string,
      confirmPassword: string
    ): Promise<void> => {
      setLoading(true);
      setError(null);

      try {
        await clientAuth.changePassword(
          currentPassword,
          newPassword,
          confirmPassword
        );

        // Redirect to login page (user needs to log in again)
        setUser(null);
        setAuthenticated(false);
        router.push('/login?passwordChanged=true');
      } catch (error: any) {
        console.error('Password change error:', error);
        setError(error.message || 'Password change failed');
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      await refreshSession();
    };

    initAuth();
  }, [refreshSession]);

  return {
    user,
    loading,
    authenticated,
    error,
    login,
    register,
    logout,
    refreshSession,
    resetPassword,
    confirmResetPassword,
    changePassword,
  };
};

export default useAuth;

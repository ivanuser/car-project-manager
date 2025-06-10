/**
 * AuthProvider.tsx - Authentication context provider
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, UseAuthResult } from './useAuth';
import { User } from '@/lib/client-auth';

// Create auth context
const AuthContext = createContext<UseAuthResult | undefined>(undefined);

// Context provider props
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication context provider component
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use auth context
 */
export const useAuthContext = (): UseAuthResult => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Export interfaces
export type { User };

export default AuthProvider;

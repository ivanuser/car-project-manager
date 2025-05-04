/**
 * AuthProvider.tsx - Authentication context provider
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, UseAuthResult, User, LoginData, RegistrationData } from './useAuth';

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
export type { User, LoginData, RegistrationData };

export default AuthProvider;

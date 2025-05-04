/**
 * client.ts - Client-side only auth utilities
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

// This file provides client-safe auth utilities that don't depend on pg

import jwtUtils from './jwt';

// Mock user interface for client side
export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
}

/**
 * Client-side check if user is authenticated
 */
export const isAuthenticated = (user: any): boolean => {
  return !!user && !!user.id;
};

/**
 * Client-side check if user has admin privileges
 */
export const isAdmin = (user: any): boolean => {
  return isAuthenticated(user) && !!user.isAdmin;
};

/**
 * Client-side API call to register user
 */
export const registerUser = async (
  email: string,
  password: string,
  confirmPassword: string
): Promise<{ user: User; token: string }> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, confirmPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Registration failed');
  }

  return await response.json();
};

/**
 * Client-side API call to login user
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<{ user: User; token: string }> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Login failed');
  }

  return await response.json();
};

/**
 * Client-side API call to logout user
 */
export const logoutUser = async (): Promise<void> => {
  await fetch('/api/auth/logout', {
    method: 'POST',
  });
};

/**
 * Client-side API call to get current session
 */
export const getSession = async (): Promise<{ user: User | null; authenticated: boolean }> => {
  const response = await fetch('/api/auth/session');
  
  if (!response.ok) {
    return { user: null, authenticated: false };
  }
  
  return await response.json();
};

/**
 * Client-side API call to refresh authentication
 */
export const refreshAuth = async (): Promise<{ user: User; token: string }> => {
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to refresh authentication');
  }

  return await response.json();
};

// Only export client-safe methods
export default {
  isAuthenticated,
  isAdmin,
  registerUser,
  loginUser,
  logoutUser,
  getSession,
  refreshAuth,
  jwt: jwtUtils,
};

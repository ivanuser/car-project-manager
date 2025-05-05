"use server"

/**
 * auth-redirect.ts - Server actions for authentication redirects
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwtUtils from '@/lib/auth/jwt';

/**
 * Redirect to dashboard if authenticated
 * Used on login/register pages to redirect to dashboard if already logged in
 */
export async function redirectIfAuthenticated() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('cajpro_auth_token')?.value;
  
  if (authToken) {
    try {
      // Verify token
      const payload = jwtUtils.verifyToken(authToken);
      
      // Check if token is expired
      if (payload && !jwtUtils.isTokenExpired(authToken)) {
        // If token is valid, redirect to dashboard
        redirect('/dashboard');
      }
    } catch (error) {
      // If token verification fails, just continue
      console.error('Token verification failed:', error);
    }
  }
  
  // If no token or token is invalid, continue
  return { authenticated: false };
}

/**
 * Redirect to login if not authenticated
 * Used on protected pages to redirect to login if not logged in
 */
export async function redirectIfNotAuthenticated() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('cajpro_auth_token')?.value;
  
  if (!authToken) {
    // No token, redirect to login
    redirect('/login');
  }
  
  try {
    // Verify token
    const payload = jwtUtils.verifyToken(authToken);
    
    // Check if token is expired
    if (!payload || jwtUtils.isTokenExpired(authToken)) {
      // Token is invalid or expired, redirect to login
      redirect('/login');
    }
  } catch (error) {
    // Token verification failed, redirect to login
    console.error('Token verification failed:', error);
    redirect('/login');
  }
  
  // If token is valid, continue
  return { authenticated: true };
}

/**
 * Check if user is authenticated
 * Used to check authentication status without redirecting
 */
export async function checkAuthentication() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('cajpro_auth_token')?.value;
  
  if (!authToken) {
    return { authenticated: false };
  }
  
  try {
    // Verify token
    const payload = jwtUtils.verifyToken(authToken);
    
    // Check if token is expired
    if (!payload || jwtUtils.isTokenExpired(authToken)) {
      return { authenticated: false };
    }
    
    // Token is valid
    return { 
      authenticated: true,
      userId: payload.sub,
      email: payload.email,
      isAdmin: payload.isAdmin,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return { authenticated: false };
  }
}

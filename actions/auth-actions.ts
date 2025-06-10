"use server"

/**
 * auth-actions.ts - Server actions for authentication
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import authService from '@/lib/auth/auth-service';
import jwtUtils from '@/lib/auth/jwt';
import { z } from 'zod';

// Validation schema for login
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Validation schema for registration
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

/**
 * Sign up a new user
 * @param formData - Form data with email, password, and confirmPassword
 * @returns Result of the registration
 */
export async function signUp(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  
  // Validate form data
  const validationResult = registerSchema.safeParse({ 
    email, 
    password, 
    confirmPassword 
  });
  
  if (!validationResult.success) {
    return { 
      error: 'Validation failed', 
      details: validationResult.error.errors 
    };
  }
  
  try {
    // Register user
    const authResult = await authService.registerUser({
      email,
      password,
      confirmPassword,
    });
    
    // Set authentication cookies
    setAuthCookies(authResult.token, authResult.refreshToken);
    
    // Return success
    return {
      success: true,
      redirectUrl: '/dashboard',
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
      },
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Check if it's a duplicate email error
    if (error.message.includes('already exists')) {
      return { error: 'User with this email already exists' };
    }
    
    return { error: error.message || 'Registration failed' };
  }
}

/**
 * Sign in a user
 * @param formData - Form data with email and password
 * @returns Result of the login
 */
export async function signIn(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  // Validate form data
  const validationResult = loginSchema.safeParse({ email, password });
  if (!validationResult.success) {
    return { 
      error: 'Validation failed', 
      details: validationResult.error.errors 
    };
  }
  
  try {
    // Login user
    const authResult = await authService.loginUser({
      email,
      password,
    });
    
    // Set authentication cookies
    setAuthCookies(authResult.token, authResult.refreshToken);
    
    // Return success
    return {
      success: true,
      redirectUrl: '/dashboard',
      user: {
        id: authResult.user.id,
        email: authResult.user.email,
        isAdmin: authResult.user.isAdmin,
      },
    };
  } catch (error: any) {
    console.error('Login error:', error);
    return { error: error.message || 'Login failed' };
  }
}

/**
 * Sign out a user - Simplified version that works with client-side logout
 */
export async function signOut() {
  try {
    // Clear authentication cookies server-side
    clearAuthCookies();
    
    // Return success with redirect to landing page
    return { success: true, redirectUrl: '/' };
  } catch (error) {
    console.error('Error during sign out:', error);
    
    // Still clear cookies and return success with redirect
    clearAuthCookies();
    return { success: true, redirectUrl: '/' };
  }
}

/**
 * Request password reset
 * @param formData - Form data with email
 * @returns Result of the request
 */
export async function requestPasswordReset(formData: FormData) {
  const email = formData.get('email') as string;
  
  try {
    // Request password reset
    const resetToken = await authService.requestPasswordReset(email);
    
    // Always return success even if email not found
    // (prevents email enumeration attacks)
    return { 
      success: true,
      message: 'Password reset instructions sent if email exists',
    };
  } catch (error: any) {
    console.error('Password reset request error:', error);
    
    // Still return success to prevent email enumeration
    return { 
      success: true,
      message: 'Password reset instructions sent if email exists',
    };
  }
}

/**
 * Reset password
 * @param formData - Form data with token, password, and confirmPassword
 * @returns Result of the reset
 */
export async function resetPassword(formData: FormData) {
  const token = formData.get('token') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  
  // Validation
  if (!token) {
    return { error: 'Reset token is required' };
  }
  
  if (password !== confirmPassword) {
    return { error: "Passwords don't match" };
  }
  
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' };
  }
  
  try {
    // Reset password
    const success = await authService.resetPassword(token, password);
    
    if (success) {
      return { 
        success: true,
        message: 'Password reset successful',
      };
    } else {
      return { error: 'Failed to reset password' };
    }
  } catch (error: any) {
    console.error('Password reset error:', error);
    
    // Check for specific errors
    if (error.message.includes('Invalid reset token')) {
      return { error: 'Invalid or expired reset token' };
    }
    
    return { error: error.message || 'Password reset failed' };
  }
}

/**
 * Change password
 * @param formData - Form data with currentPassword, newPassword, and confirmPassword
 * @returns Result of the change
 */
export async function changePassword(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  
  // Validation
  if (!currentPassword) {
    return { error: 'Current password is required' };
  }
  
  if (newPassword !== confirmPassword) {
    return { error: "New passwords don't match" };
  }
  
  if (newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters' };
  }
  
  try {
    // Get token from cookies (using consistent cookie name)
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token')?.value;
    
    if (!token) {
      return { error: 'Authentication required' };
    }
    
    // Get user ID from token
    const userId = jwtUtils.getUserIdFromToken(token);
    if (!userId) {
      return { error: 'Invalid token' };
    }
    
    // Change password
    const success = await authService.changePassword(
      userId,
      currentPassword,
      newPassword
    );
    
    if (success) {
      // Clear authentication cookies (user will need to login again)
      clearAuthCookies();
      
      return { 
        success: true,
        message: 'Password changed successfully',
      };
    } else {
      return { error: 'Failed to change password' };
    }
  } catch (error: any) {
    console.error('Password change error:', error);
    
    // Check for specific errors
    if (error.message.includes('Current password is incorrect')) {
      return { error: 'Current password is incorrect' };
    }
    
    return { error: error.message || 'Password change failed' };
  }
}

/**
 * Set authentication cookies - Fixed to use consistent cookie name
 * @param token - JWT token
 * @param refreshToken - Refresh token
 */
function setAuthCookies(token: string, refreshToken: string) {
  const cookieStore = cookies();
  
  // JWT expiration time (default: 1 hour)
  const jwtExpiration = process.env.JWT_EXPIRATION
    ? parseInt(process.env.JWT_EXPIRATION, 10)
    : 3600; // 1 hour in seconds
    
  // Refresh token expiration time (default: 7 days)
  const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION
    ? parseInt(process.env.REFRESH_TOKEN_EXPIRATION, 10)
    : 604800; // 7 days in seconds
  
  // Set JWT token cookie (using consistent name 'auth-token')
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: jwtExpiration,
  });
  
  // Set refresh token cookie
  cookieStore.set('auth-refresh-token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: refreshTokenExpiration,
  });
}

/**
 * Clear authentication cookies - Fixed to use consistent cookie names
 */
function clearAuthCookies() {
  const cookieStore = cookies();
  
  // Delete all possible auth cookies for compatibility
  cookieStore.delete('auth-token');
  cookieStore.delete('auth-refresh-token');
  cookieStore.delete('cajpro_auth_token');
  cookieStore.delete('cajpro_refresh_token');
}

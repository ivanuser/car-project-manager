"use server"

import { cookies } from 'next/headers';
import jwtUtils from '@/lib/auth/jwt';
import db from '@/lib/db';

/**
 * Auth client to replace Supabase auth functionality
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

// Types for compatibility with previous Supabase usage
interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
}

interface UserResponse {
  data: {
    user: User | null;
  };
  error?: any;
}

interface SignInResponse {
  data: {
    user: User | null;
    session?: any;
  };
  error?: any;
}

interface AuthClient {
  auth: {
    getUser: () => Promise<UserResponse>;
    signOut: () => Promise<{ error: any }>;
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<SignInResponse>;
    signUp: (credentials: { email: string; password: string }) => Promise<SignInResponse>;
  };
}

/**
 * Get the current user from the auth token
 * @returns User object or null if not authenticated
 */
export async function getUser(): Promise<UserResponse> {
  try {
    const cookieStore = cookies();
    const authToken = cookieStore.get('cajpro_auth_token')?.value;
    
    if (!authToken) {
      console.log("No auth token found in cookies");
      
      // For development mode only
      if (process.env.NODE_ENV === 'development') {
        const devMode = typeof localStorage !== 'undefined' && localStorage.getItem('cajpro_dev_mode') === 'admin';
        
        if (devMode) {
          return {
            data: {
              user: {
                id: 'admin-dev-mode',
                email: 'admin@cajpro.local',
                isAdmin: true
              }
            }
          };
        }
      }
      
      return { data: { user: null } };
    }
    
    // Validate token and get user ID
    const payload = jwtUtils.verifyToken(authToken);
    if (!payload) {
      console.log("Invalid auth token");
      return { data: { user: null } };
    }
    
    // Check if token is expired
    if (jwtUtils.isTokenExpired(authToken)) {
      console.log("Auth token expired");
      return { data: { user: null } };
    }
    
    // Extract user info from payload
    const email = payload.email;
    const userId = payload.sub;
    const isAdmin = payload.isAdmin;
    
    // Return user object in format similar to Supabase for compatibility
    return {
      data: {
        user: {
          id: userId,
          email,
          isAdmin
        }
      }
    };
  } catch (error) {
    console.error("Error getting user:", error);
    return { data: { user: null } };
  }
}

/**
 * Sign in with email and password
 * @param credentials User credentials
 * @returns Sign in response
 */
export async function signInWithPassword(credentials: { email: string; password: string }): Promise<SignInResponse> {
  try {
    // Check if user exists and password is correct
    const userResult = await db.query(
      `SELECT id, email, password_hash, is_admin FROM users WHERE email = $1`,
      [credentials.email]
    );
    
    if (userResult.rows.length === 0) {
      return {
        data: { user: null },
        error: "Invalid email or password"
      };
    }
    
    const user = userResult.rows[0];
    
    // Verify password (replace with your password verification logic)
    // This is a placeholder - implement proper password verification
    const passwordMatches = true; // Implement actual password verification
    
    if (!passwordMatches) {
      return {
        data: { user: null },
        error: "Invalid email or password"
      };
    }
    
    // Generate JWT token
    const token = jwtUtils.generateToken({
      id: user.id,
      email: user.email,
      isAdmin: user.is_admin
    });
    
    // Set cookie in response
    cookies().set('cajpro_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });
    
    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          isAdmin: user.is_admin
        }
      }
    };
  } catch (error) {
    console.error("Error signing in:", error);
    return {
      data: { user: null },
      error: (error as Error).message
    };
  }
}

/**
 * Sign up with email and password
 * @param credentials User credentials
 * @returns Sign up response
 */
export async function signUp(credentials: { email: string; password: string }): Promise<SignInResponse> {
  try {
    // Check if user already exists
    const existingUser = await db.query(
      `SELECT id FROM users WHERE email = $1`,
      [credentials.email]
    );
    
    if (existingUser.rows.length > 0) {
      return {
        data: { user: null },
        error: "User with this email already exists"
      };
    }
    
    // Create new user (replace with your password hashing logic)
    // This is a placeholder - implement proper password hashing
    const passwordHash = credentials.password; // Actually hash the password
    
    const newUserResult = await db.query(
      `INSERT INTO users (email, password_hash, created_at, updated_at)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email`,
      [credentials.email, passwordHash, new Date(), new Date()]
    );
    
    const newUser = newUserResult.rows[0];
    
    // Generate JWT token
    const token = jwtUtils.generateToken({
      id: newUser.id,
      email: newUser.email,
      isAdmin: false
    });
    
    // Set cookie in response
    cookies().set('cajpro_auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/'
    });
    
    return {
      data: {
        user: {
          id: newUser.id,
          email: newUser.email,
          isAdmin: false
        }
      }
    };
  } catch (error) {
    console.error("Error signing up:", error);
    return {
      data: { user: null },
      error: (error as Error).message
    };
  }
}

/**
 * Sign out the current user
 * @returns Success status
 */
export async function signOut() {
  try {
    cookies().delete('cajpro_auth_token');
    
    return { error: null };
  } catch (error) {
    console.error("Error signing out:", error);
    return { error: (error as Error).message };
  }
}

/**
 * Create auth client for server-side auth operations
 * This is a compatibility function to replace createServerClient
 */
export function createServerClient(): AuthClient {
  return {
    auth: {
      getUser,
      signOut,
      signInWithPassword,
      signUp
    }
  };
}

export default {
  createServerClient,
  getUser,
  signOut,
  signInWithPassword,
  signUp
};

/**
 * auth-helpers.ts - Helper functions for authentication
 * For Caj-pro car project build tracking application
 * Created on: May 17, 2025
 */

import { cookies } from "next/headers";
import db from "@/lib/db";
import jwtUtils from "@/lib/auth/jwt";

export interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
  fullName?: string;
  avatarUrl?: string;
}

/**
 * Get the current authenticated user
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Get auth token from cookies
    const cookieStore = cookies();
    const authCookie = cookieStore.get('cajpro_auth_token');
    
    if (!authCookie?.value) {
      console.log("No auth token found in cookies");
      return null;
    }
    
    // Verify the token
    const payload = jwtUtils.verifyToken(authCookie.value);
    if (!payload || jwtUtils.isTokenExpired(authCookie.value)) {
      console.log("Invalid or expired auth token");
      return null;
    }
    
    // Get user data
    const userId = payload.sub;
    const userResult = await db.query(
      `SELECT email, is_admin FROM auth.users WHERE id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      console.log("User not found in database");
      return null;
    }
    
    const user = userResult.rows[0];
    
    // Get profile data
    const profileResult = await db.query(
      `SELECT full_name, avatar_url FROM profiles WHERE id = $1`,
      [userId]
    );
    
    const profile = profileResult.rows[0] || {};
    
    return {
      id: userId,
      email: user.email,
      isAdmin: user.is_admin || false,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
    };
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}

/**
 * Check if the user is authenticated
 * @returns True if authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  return (await getCurrentUser()) !== null;
}

/**
 * Check if the user is an admin
 * @returns True if the user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.isAdmin || false;
}

/**
 * Check if we're in development mode
 * @returns True if in development mode
 */
export function isDevelopmentMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Get the admin user for development mode
 * @returns Admin user data for development
 */
export async function getDevAdminUser(): Promise<User | null> {
  // Only available in development mode
  if (!isDevelopmentMode()) {
    return null;
  }
  
  try {
    // Look up the admin user
    const adminResult = await db.query(
      `SELECT id, email, is_admin FROM auth.users WHERE email = 'admin@cajpro.local' LIMIT 1`
    );
    
    if (adminResult.rows.length === 0) {
      // Create a placeholder admin user
      return {
        id: "admin-dev-mode",
        email: "admin@cajpro.local",
        isAdmin: true,
        fullName: "Admin User",
      };
    }
    
    const admin = adminResult.rows[0];
    
    // Get profile data
    const profileResult = await db.query(
      `SELECT full_name, avatar_url FROM profiles WHERE id = $1`,
      [admin.id]
    );
    
    const profile = profileResult.rows[0] || {};
    
    return {
      id: admin.id,
      email: admin.email,
      isAdmin: admin.is_admin || false,
      fullName: profile.full_name || "Admin User",
      avatarUrl: profile.avatar_url,
    };
  } catch (error) {
    console.error("Error getting admin user for development:", error);
    
    // Return a placeholder admin user
    return {
      id: "admin-dev-mode",
      email: "admin@cajpro.local",
      isAdmin: true,
      fullName: "Admin User",
    };
  }
}

/**
 * auth-service.ts - Authentication service for Caj-pro
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

// Import with type-only import to prevent actual module loading
import type { Pool, PoolClient } from 'pg';

// Will be dynamically initialized based on environment
let db: any;

// Initialize database safely
const initDb = async () => {
  // Only import database on server-side
  if (typeof window === 'undefined') {
    try {
      db = (await import('./db')).default;
    } catch (error) {
      console.error('Failed to import database module:', error);
      // Provide fallback implementation
      db = {
        query: async () => ({ rows: [], rowCount: 0 }),
        getClient: async () => ({ query: async () => ({}), release: () => {} }),
        transaction: async (cb: any) => await cb({ query: async () => ({}) }),
      };
    }
  } else {
    // Client-side fallback
    db = {
      query: async () => ({ rows: [], rowCount: 0 }),
      getClient: async () => ({ query: async () => ({}), release: () => {} }),
      transaction: async (cb: any) => await cb({ query: async () => ({}) }),
    };
  }
  return db;
};

import passwordUtils from './password';
import jwtUtils from './jwt';

// User interface
export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
  emailConfirmedAt?: Date;
  lastSignInAt?: Date;
}

// Registration data interface
export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Login data interface
export interface LoginData {
  email: string;
  password: string;
}

// Authentication result interface
export interface AuthResult {
  user: User;
  token: string;
  refreshToken: string;
}

/**
 * Get user by ID
 * @param userId - User ID
 * @returns User or null if not found
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  await initDb();
  
  try {
    const result = await db.query(
      `SELECT id, email, is_admin as "isAdmin", 
       created_at as "createdAt", updated_at as "updatedAt", 
       email_confirmed_at as "emailConfirmedAt", 
       last_sign_in_at as "lastSignInAt"
       FROM auth.users WHERE id = $1`,
      [userId]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
};

/**
 * Get user by email
 * @param email - User email
 * @returns User or null if not found
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  await initDb();
  
  try {
    const result = await db.query(
      `SELECT id, email, is_admin as "isAdmin", 
       created_at as "createdAt", updated_at as "updatedAt", 
       email_confirmed_at as "emailConfirmedAt", 
       last_sign_in_at as "lastSignInAt"
       FROM auth.users WHERE email = $1`,
      [email]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
};

/**
 * Register a new user
 * @param data - Registration data
 * @returns Authentication result
 */
export const registerUser = async (
  data: RegistrationData
): Promise<AuthResult> => {
  await initDb();
  
  try {
    // Validate registration data
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const salt = passwordUtils.generateSalt();
    const passwordHash = passwordUtils.hashPasswordWithSalt(data.password, salt);
    
    // Create user in database
    const result = await db.transaction(async (client: any) => {
      // Insert user
      const userResult = await client.query(
        `INSERT INTO auth.users (email, password_hash, salt, is_admin)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, is_admin as "isAdmin", 
         created_at as "createdAt", updated_at as "updatedAt"`,
        [data.email, passwordHash, salt, false]
      );
      
      const user = userResult.rows[0];
      
      // Generate tokens
      const token = jwtUtils.generateToken({
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      });
      
      const refreshToken = jwtUtils.generateRefreshToken(user.id);
      
      // Calculate expiration dates
      const jwtExpiration = process.env.JWT_EXPIRATION
        ? parseInt(process.env.JWT_EXPIRATION, 10)
        : 3600; // 1 hour in seconds
        
      const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION
        ? parseInt(process.env.REFRESH_TOKEN_EXPIRATION, 10)
        : 604800; // 7 days in seconds
        
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + jwtExpiration);
      
      const refreshExpiresAt = new Date();
      refreshExpiresAt.setSeconds(refreshExpiresAt.getSeconds() + refreshTokenExpiration);
      
      // Create session
      await client.query(
        `INSERT INTO auth.sessions (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, token, expiresAt]
      );
      
      // Create refresh token
      await client.query(
        `INSERT INTO auth.refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, refreshToken, refreshExpiresAt]
      );
      
      // Create user profile if needed (assuming profiles table exists)
      try {
        await client.query(
          `INSERT INTO profiles (id, full_name)
           VALUES ($1, $2)
           ON CONFLICT (id) DO NOTHING`,
          [user.id, ''] // Empty full_name initially
        );
      } catch (error) {
        console.error('Error creating user profile:', error);
        // Continue even if this fails, as the user is already created
      }
      
      return {
        user,
        token,
        refreshToken,
      };
    });
    
    return result;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

/**
 * Login a user
 * @param data - Login data
 * @returns Authentication result
 */
export const loginUser = async (data: LoginData): Promise<AuthResult> => {
  await initDb();
  
  try {
    // Find user by email
    const userResult = await db.query(
      `SELECT id, email, password_hash, salt, is_admin as "isAdmin",
       created_at as "createdAt", updated_at as "updatedAt",
       email_confirmed_at as "emailConfirmedAt",
       last_sign_in_at as "lastSignInAt"
       FROM auth.users WHERE email = $1`,
      [data.email]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password');
    }
    
    const user = userResult.rows[0];
    
    // Verify password
    const passwordHash = passwordUtils.hashPasswordWithSalt(
      data.password,
      user.salt
    );
    
    if (passwordHash !== user.password_hash) {
      throw new Error('Invalid email or password');
    }
    
    // Generate tokens
    const token = jwtUtils.generateToken({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });
    
    const refreshToken = jwtUtils.generateRefreshToken(user.id);
    
    // Calculate expiration dates
    const jwtExpiration = process.env.JWT_EXPIRATION
      ? parseInt(process.env.JWT_EXPIRATION, 10)
      : 3600; // 1 hour in seconds
      
    const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION
      ? parseInt(process.env.REFRESH_TOKEN_EXPIRATION, 10)
      : 604800; // 7 days in seconds
      
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + jwtExpiration);
    
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setSeconds(refreshExpiresAt.getSeconds() + refreshTokenExpiration);
    
    // Store session and refresh token
    await db.transaction(async (client: any) => {
      // Create session
      await client.query(
        `INSERT INTO auth.sessions (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, token, expiresAt]
      );
      
      // Create refresh token
      await client.query(
        `INSERT INTO auth.refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, refreshToken, refreshExpiresAt]
      );
      
      // Update last sign in time
      await client.query(
        `UPDATE auth.users SET last_sign_in_at = NOW()
         WHERE id = $1`,
        [user.id]
      );
    });
    
    // Remove sensitive data
    delete user.password_hash;
    delete user.salt;
    
    return {
      user,
      token,
      refreshToken,
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

/**
 * Logout a user
 * @param token - JWT token
 * @returns True if logout was successful
 */
export const logoutUser = async (token: string): Promise<boolean> => {
  await initDb();
  
  try {
    // Invalidate session
    const result = await db.query(
      `DELETE FROM auth.sessions WHERE token = $1`,
      [token]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error logging out user:', error);
    return false;
  }
};

/**
 * Refresh authentication token
 * @param refreshToken - Refresh token
 * @returns New authentication result
 */
export const refreshAuth = async (
  refreshToken: string
): Promise<AuthResult> => {
  await initDb();
  
  try {
    // Get user ID from refresh token table
    const tokenResult = await db.query(
      `SELECT user_id, expires_at
       FROM auth.refresh_tokens
       WHERE token = $1 AND used_at IS NULL`,
      [refreshToken]
    );
    
    if (tokenResult.rows.length === 0) {
      throw new Error('Invalid refresh token');
    }
    
    const { user_id, expires_at } = tokenResult.rows[0];
    
    // Check if token is expired
    if (new Date(expires_at) < new Date()) {
      throw new Error('Refresh token expired');
    }
    
    // Get user
    const user = await getUserById(user_id);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Generate new tokens
    const newToken = jwtUtils.generateToken({
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    });
    
    const newRefreshToken = jwtUtils.generateRefreshToken(user.id);
    
    // Calculate expiration dates
    const jwtExpiration = process.env.JWT_EXPIRATION
      ? parseInt(process.env.JWT_EXPIRATION, 10)
      : 3600; // 1 hour in seconds
      
    const refreshTokenExpiration = process.env.REFRESH_TOKEN_EXPIRATION
      ? parseInt(process.env.REFRESH_TOKEN_EXPIRATION, 10)
      : 604800; // 7 days in seconds
      
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + jwtExpiration);
    
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setSeconds(refreshExpiresAt.getSeconds() + refreshTokenExpiration);
    
    // Mark old refresh token as used and create new tokens
    await db.transaction(async (client: any) => {
      // Mark old refresh token as used
      await client.query(
        `UPDATE auth.refresh_tokens SET used_at = NOW()
         WHERE token = $1`,
        [refreshToken]
      );
      
      // Create session
      await client.query(
        `INSERT INTO auth.sessions (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, newToken, expiresAt]
      );
      
      // Create refresh token
      await client.query(
        `INSERT INTO auth.refresh_tokens (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, newRefreshToken, refreshExpiresAt]
      );
    });
    
    return {
      user,
      token: newToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    console.error('Error refreshing authentication:', error);
    throw error;
  }
};

/**
 * Request password reset
 * @param email - User email
 * @returns Reset token or null if user not found
 */
export const requestPasswordReset = async (
  email: string
): Promise<string | null> => {
  await initDb();
  
  try {
    // Find user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return null;
    }
    
    // Generate reset token
    const resetToken = passwordUtils.generateToken();
    
    // Calculate expiration date (24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    // Store reset token
    await db.query(
      `INSERT INTO auth.password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, resetToken, expiresAt]
    );
    
    return resetToken;
  } catch (error) {
    console.error('Error requesting password reset:', error);
    return null;
  }
};

/**
 * Reset password
 * @param token - Reset token
 * @param newPassword - New password
 * @returns True if password was reset
 */
export const resetPassword = async (
  token: string,
  newPassword: string
): Promise<boolean> => {
  await initDb();
  
  try {
    // Check if token is valid
    const tokenResult = await db.query(
      `SELECT user_id, expires_at
       FROM auth.password_reset_tokens
       WHERE token = $1 AND used_at IS NULL`,
      [token]
    );
    
    if (tokenResult.rows.length === 0) {
      throw new Error('Invalid reset token');
    }
    
    const { user_id, expires_at } = tokenResult.rows[0];
    
    // Check if token is expired
    if (new Date(expires_at) < new Date()) {
      throw new Error('Reset token expired');
    }
    
    // Generate new password hash
    const salt = passwordUtils.generateSalt();
    const passwordHash = passwordUtils.hashPasswordWithSalt(newPassword, salt);
    
    // Update password and mark token as used
    await db.transaction(async (client: any) => {
      // Update password
      await client.query(
        `UPDATE auth.users
         SET password_hash = $1, salt = $2, updated_at = NOW()
         WHERE id = $3`,
        [passwordHash, salt, user_id]
      );
      
      // Mark token as used
      await client.query(
        `UPDATE auth.password_reset_tokens
         SET used_at = NOW()
         WHERE token = $1`,
        [token]
      );
      
      // Invalidate all sessions for the user
      await client.query(
        `DELETE FROM auth.sessions WHERE user_id = $1`,
        [user_id]
      );
    });
    
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    throw error;
  }
};

/**
 * Change password
 * @param userId - User ID
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns True if password was changed
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<boolean> => {
  await initDb();
  
  try {
    // Get user
    const userResult = await db.query(
      `SELECT password_hash, salt
       FROM auth.users
       WHERE id = $1`,
      [userId]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('User not found');
    }
    
    const { password_hash, salt } = userResult.rows[0];
    
    // Verify current password
    const currentPasswordHash = passwordUtils.hashPasswordWithSalt(
      currentPassword,
      salt
    );
    
    if (currentPasswordHash !== password_hash) {
      throw new Error('Current password is incorrect');
    }
    
    // Generate new password hash
    const newSalt = passwordUtils.generateSalt();
    const newPasswordHash = passwordUtils.hashPasswordWithSalt(newPassword, newSalt);
    
    // Update password
    await db.transaction(async (client: any) => {
      // Update password
      await client.query(
        `UPDATE auth.users
         SET password_hash = $1, salt = $2, updated_at = NOW()
         WHERE id = $3`,
        [newPasswordHash, newSalt, userId]
      );
      
      // Invalidate all sessions for the user except the current one
      // (would need session ID to be passed to not invalidate current session)
      // For now, let's invalidate all sessions as a security measure
      await client.query(
        `DELETE FROM auth.sessions WHERE user_id = $1`,
        [userId]
      );
    });
    
    return true;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

/**
 * Validate session
 * @param token - JWT token
 * @returns User or null if session is invalid
 */
export const validateSession = async (token: string): Promise<User | null> => {
  await initDb();
  
  try {
    // Verify JWT token
    const payload = jwtUtils.verifyToken(token);
    if (!payload) {
      return null;
    }
    
    // Check if token exists in sessions table
    const sessionResult = await db.query(
      `SELECT user_id, expires_at
       FROM auth.sessions
       WHERE token = $1`,
      [token]
    );
    
    if (sessionResult.rows.length === 0) {
      return null;
    }
    
    const { user_id, expires_at } = sessionResult.rows[0];
    
    // Check if session is expired
    if (new Date(expires_at) < new Date()) {
      return null;
    }
    
    // Get user
    return await getUserById(user_id);
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
};

/**
 * Check if user is admin
 * @param userId - User ID
 * @returns True if user is admin
 */
export const isAdmin = async (userId: string): Promise<boolean> => {
  await initDb();
  
  try {
    const result = await db.query(
      `SELECT is_admin FROM auth.users WHERE id = $1`,
      [userId]
    );
    
    return result.rows.length > 0 && result.rows[0].is_admin;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

export default {
  getUserById,
  getUserByEmail,
  registerUser,
  loginUser,
  logoutUser,
  refreshAuth,
  requestPasswordReset,
  resetPassword,
  changePassword,
  validateSession,
  isAdmin,
};

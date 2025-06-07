/**
 * auth-service.ts - Authentication service for CAJ-Pro (Fixed)
 * Properly integrated with PostgreSQL database
 */

import db from '@/lib/db'; // Use main database connection
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
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const result = await db.query(
      `SELECT id, email, email_verified as "isAdmin", 
       created_at as "createdAt", updated_at as "updatedAt", 
       email_verified_at as "emailConfirmedAt", 
       last_sign_in_at as "lastSignInAt"
       FROM users WHERE id = $1`,
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
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  try {
    const result = await db.query(
      `SELECT id, email, email_verified as "isAdmin", 
       created_at as "createdAt", updated_at as "updatedAt", 
       email_verified_at as "emailConfirmedAt", 
       last_sign_in_at as "lastSignInAt"
       FROM users WHERE email = $1`,
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
 */
export const registerUser = async (data: RegistrationData): Promise<AuthResult> => {
  try {
    // Validate registration data
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash password
    const passwordHash = await passwordUtils.hashPassword(data.password);
    
    // Create user in database
    const result = await db.transaction(async (client) => {
      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, email_verified)
         VALUES ($1, $2, $3)
         RETURNING id, email, email_verified, created_at, updated_at`,
        [data.email, passwordHash, true] // Auto-verify for development
      );
      
      const user = userResult.rows[0];
      
      // Transform to expected format
      const formattedUser = {
        id: user.id,
        email: user.email,
        isAdmin: user.email === 'admin@cajpro.local', // Admin check
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
      
      // Generate tokens
      const token = jwtUtils.generateToken({
        sub: user.id,
        email: user.email,
        isAdmin: formattedUser.isAdmin,
      });
      
      const refreshToken = jwtUtils.generateRefreshToken(user.id);
      
      // Calculate expiration date (7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Create session
      await client.query(
        `INSERT INTO sessions (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, token, expiresAt]
      );
      
      // Create user profile
      try {
        await client.query(
          `INSERT INTO profiles (user_id, full_name)
           VALUES ($1, $2)
           ON CONFLICT (user_id) DO NOTHING`,
          [user.id, ''] // Empty full_name initially
        );
      } catch (error) {
        console.error('Error creating user profile:', error);
        // Continue even if this fails
      }
      
      return {
        user: formattedUser,
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
 */
export const loginUser = async (data: LoginData): Promise<AuthResult> => {
  try {
    // Find user by email
    const userResult = await db.query(
      `SELECT id, email, password_hash, email_verified,
       created_at, updated_at, email_verified_at,
       last_sign_in_at
       FROM users WHERE email = $1`,
      [data.email]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password');
    }
    
    const user = userResult.rows[0];
    
    // Verify password
    const isValidPassword = await passwordUtils.verifyPassword(data.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    
    // Transform to expected format
    const formattedUser = {
      id: user.id,
      email: user.email,
      isAdmin: user.email === 'admin@cajpro.local', // Admin check
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      emailConfirmedAt: user.email_verified_at,
      lastSignInAt: user.last_sign_in_at
    };
    
    // Generate tokens
    const token = jwtUtils.generateToken({
      sub: user.id,
      email: user.email,
      isAdmin: formattedUser.isAdmin,
    });
    
    const refreshToken = jwtUtils.generateRefreshToken(user.id);
    
    // Calculate expiration date (7 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    // Store session
    await db.transaction(async (client) => {
      // Create session
      await client.query(
        `INSERT INTO sessions (user_id, token, expires_at)
         VALUES ($1, $2, $3)`,
        [user.id, token, expiresAt]
      );
      
      // Update last sign in time
      await client.query(
        `UPDATE users SET last_sign_in_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [user.id]
      );
    });
    
    return {
      user: formattedUser,
      token,
      refreshToken,
    };
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Validate session
 */
export const validateSession = async (token: string): Promise<User | null> => {
  try {
    // Verify JWT token first
    const payload = jwtUtils.verifyToken(token);
    if (!payload || !payload.sub) {
      return null;
    }
    
    // Check if session exists and is not expired
    const sessionResult = await db.query(
      `SELECT s.user_id, s.expires_at, u.email, u.email_verified
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 AND s.expires_at > NOW()`,
      [token]
    );
    
    if (sessionResult.rows.length === 0) {
      return null;
    }
    
    const session = sessionResult.rows[0];
    
    // Return user info
    return {
      id: session.user_id,
      email: session.email,
      isAdmin: session.email === 'admin@cajpro.local',
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error('Error validating session:', error);
    return null;
  }
};

/**
 * Logout a user
 */
export const logoutUser = async (token: string): Promise<boolean> => {
  try {
    // Delete session
    const result = await db.query(
      `DELETE FROM sessions WHERE token = $1`,
      [token]
    );
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Error logging out user:', error);
    return false;
  }
};

/**
 * Create default admin user if it doesn't exist
 */
export const createDefaultAdminUser = async (): Promise<void> => {
  try {
    const adminEmail = 'admin@cajpro.local';
    const adminPassword = 'admin123';
    
    // Check if admin user already exists
    const existingAdmin = await getUserByEmail(adminEmail);
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }
    
    // Create admin user
    const passwordHash = await passwordUtils.hashPassword(adminPassword);
    
    await db.transaction(async (client) => {
      // Insert admin user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, email_verified)
         VALUES ($1, $2, $3)
         RETURNING id`,
        [adminEmail, passwordHash, true]
      );
      
      const userId = userResult.rows[0].id;
      
      // Create admin profile
      await client.query(
        `INSERT INTO profiles (user_id, full_name)
         VALUES ($1, $2)`,
        [userId, 'CAJ-Pro Administrator']
      );
    });
    
    console.log('Default admin user created successfully');
  } catch (error) {
    console.error('Error creating default admin user:', error);
  }
};

export default {
  getUserById,
  getUserByEmail,
  registerUser,
  loginUser,
  logoutUser,
  validateSession,
  createDefaultAdminUser,
};

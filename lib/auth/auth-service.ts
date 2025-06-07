/**
 * auth-service.ts - Fixed Authentication service for CAJ-Pro
 * Properly integrated with PostgreSQL database with unique session management
 */

import db from '@/lib/db';
import passwordUtils from './password';
import jwtUtils from './jwt';
import crypto from 'crypto';

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
 * Generate a unique session token
 */
const generateUniqueSessionToken = (): string => {
  const timestamp = Date.now().toString();
  const randomBytes = crypto.randomBytes(32).toString('hex');
  const combined = `${timestamp}-${randomBytes}-${crypto.randomUUID()}`;
  return crypto.createHash('sha256').update(combined).digest('hex');
};

/**
 * Clean up expired sessions for a user
 */
const cleanupExpiredSessions = async (userId: string): Promise<void> => {
  try {
    await db.query(
      'DELETE FROM sessions WHERE user_id = $1 AND (expires_at < NOW() OR is_active = false)',
      [userId]
    );
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    const result = await db.query(
      `SELECT id, email, is_admin as "isAdmin", 
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
      `SELECT id, email, is_admin as "isAdmin", 
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
    console.log('Register user: Starting registration for', data.email);
    
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
    console.log('Register user: Password hashed');
    
    // Create user in database transaction
    const result = await db.transaction(async (client) => {
      // Insert user
      const userResult = await client.query(
        `INSERT INTO users (email, password_hash, email_verified, email_verified_at)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, is_admin, created_at, updated_at`,
        [data.email, passwordHash, true, new Date()] // Auto-verify for development
      );
      
      const user = userResult.rows[0];
      console.log('Register user: User created with ID', user.id);
      
      // Transform to expected format
      const formattedUser = {
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin || user.email === 'admin@cajpro.local',
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
      console.log('Register user: JWT tokens generated');
      
      // Generate unique session token
      let sessionToken;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        sessionToken = generateUniqueSessionToken();
        
        // Check if this token already exists
        const existingSession = await client.query(
          'SELECT id FROM sessions WHERE token = $1',
          [sessionToken]
        );
        
        if (existingSession.rows.length === 0) {
          break; // Token is unique
        }
        
        attempts++;
        console.log(`Register user: Token collision attempt ${attempts}`);
      }
      
      if (attempts >= maxAttempts) {
        throw new Error('Failed to generate unique session token');
      }
      
      // Calculate expiration date (7 days)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      
      // Create session with unique token
      await client.query(
        `INSERT INTO sessions (user_id, token, expires_at, is_active)
         VALUES ($1, $2, $3, $4)`,
        [user.id, sessionToken, expiresAt, true]
      );
      
      console.log('Register user: Session created');
      
      // Create user profile
      try {
        await client.query(
          `INSERT INTO profiles (user_id, full_name)
           VALUES ($1, $2)
           ON CONFLICT (user_id) DO NOTHING`,
          [user.id, ''] // Empty full_name initially
        );
        console.log('Register user: Profile created');
      } catch (error) {
        console.error('Error creating user profile:', error);
        // Continue even if this fails
      }
      
      return {
        user: formattedUser,
        token: sessionToken, // Use session token instead of JWT
        refreshToken,
      };
    });
    
    console.log('Register user: Registration completed successfully');
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
    console.log('Login user: Starting login for', data.email);
    
    // Find user by email
    const userResult = await db.query(
      `SELECT id, email, password_hash, is_admin,
       created_at, updated_at, email_verified_at,
       last_sign_in_at
       FROM users WHERE email = $1`,
      [data.email]
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password');
    }
    
    const user = userResult.rows[0];
    console.log('Login user: User found');
    
    // Verify password
    const isValidPassword = await passwordUtils.verifyPassword(data.password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    
    console.log('Login user: Password verified');
    
    // Clean up old sessions first
    await cleanupExpiredSessions(user.id);
    
    // Transform to expected format
    const formattedUser = {
      id: user.id,
      email: user.email,
      isAdmin: user.is_admin || user.email === 'admin@cajpro.local',
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
    console.log('Login user: JWT tokens generated');
    
    // Store session with retry logic for unique constraint
    await db.transaction(async (client) => {
      // Generate unique session token with retry logic
      let sessionToken;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (attempts < maxAttempts) {
        sessionToken = generateUniqueSessionToken();
        
        try {
          // Calculate expiration date (7 days)
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);
          
          // Try to create session
          await client.query(
            `INSERT INTO sessions (user_id, token, expires_at, is_active)
             VALUES ($1, $2, $3, $4)`,
            [user.id, sessionToken, expiresAt, true]
          );
          
          console.log('Login user: Session created successfully');
          break; // Success, exit loop
          
        } catch (sessionError: any) {
          if (sessionError.code === '23505' && sessionError.constraint === 'sessions_token_key') {
            // Unique constraint violation, try again
            attempts++;
            console.log(`Login user: Token collision attempt ${attempts}, retrying...`);
            
            if (attempts >= maxAttempts) {
              throw new Error('Failed to generate unique session token after multiple attempts');
            }
            
            // Wait a short time before retry
            await new Promise(resolve => setTimeout(resolve, 10));
            continue;
          } else {
            // Different error, re-throw
            throw sessionError;
          }
        }
      }
      
      // Update last sign in time
      await client.query(
        `UPDATE users SET last_sign_in_at = NOW(), updated_at = NOW()
         WHERE id = $1`,
        [user.id]
      );
      
      console.log('Login user: Last sign in updated');
    });
    
    console.log('Login user: Login completed successfully');
    
    return {
      user: formattedUser,
      token, // Return JWT token for client-side auth
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
    // First try to verify as JWT token
    try {
      const payload = jwtUtils.verifyToken(token);
      if (payload && payload.sub) {
        return await getUserById(payload.sub);
      }
    } catch (jwtError) {
      // Not a valid JWT, try as session token
    }
    
    // Check if it's a session token in database
    const sessionResult = await db.query(
      `SELECT s.user_id, s.expires_at, u.email, u.is_admin
       FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.token = $1 AND s.expires_at > NOW() AND s.is_active = true`,
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
      isAdmin: session.is_admin || session.email === 'admin@cajpro.local',
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
    // Try to delete as session token first
    const sessionResult = await db.query(
      `UPDATE sessions SET is_active = false WHERE token = $1`,
      [token]
    );
    
    return sessionResult.rowCount > 0;
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
        `INSERT INTO users (email, password_hash, is_admin, email_verified, email_verified_at)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [adminEmail, passwordHash, true, true, new Date()]
      );
      
      const userId = userResult.rows[0].id;
      
      // Create admin profile
      await client.query(
        `INSERT INTO profiles (user_id, full_name)
         VALUES ($1, $2)
         ON CONFLICT (user_id) DO NOTHING`,
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
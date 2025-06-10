/**
 * Production-Ready Authentication Service
 * Handles user authentication with persistent sessions
 */

import db from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResult {
  user: User;
  token: string;
  sessionId: string;
}

/**
 * Generate secure session token
 */
function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate JWT token
 */
function generateJWT(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Verify JWT token
 */
function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Register new user
 */
export async function registerUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Check if user exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.rows.length > 0) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user and session in transaction
    const result = await db.transaction(async (client) => {
      // Insert user
      const userResult = await client.query(`
        INSERT INTO users (email, password_hash, email_verified, email_verified_at)
        VALUES ($1, $2, true, CURRENT_TIMESTAMP)
        RETURNING id, email, is_admin, created_at, updated_at
      `, [email, passwordHash]);
      
      const user = userResult.rows[0];
      
      // Generate tokens
      const jwtToken = generateJWT({
        sub: user.id,
        email: user.email,
        isAdmin: user.is_admin
      });
      
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
      
      // Create session
      const sessionResult = await client.query(`
        INSERT INTO sessions (user_id, token, expires_at, is_active)
        VALUES ($1, $2, $3, true)
        RETURNING id
      `, [user.id, sessionToken, expiresAt]);
      
      const sessionId = sessionResult.rows[0].id;
      
      // Create profile
      await client.query(`
        INSERT INTO profiles (user_id, full_name)
        VALUES ($1, $2)
      `, [user.id, '']);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          isAdmin: user.is_admin,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        },
        token: sessionToken,
        sessionId
      };
    });
    
    console.log(`✅ User registered successfully: ${email}`);
    return result;
    
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Login user
 */
export async function loginUser(email: string, password: string): Promise<AuthResult> {
  try {
    // Get user with password
    const userResult = await db.query(`
      SELECT id, email, password_hash, is_admin, created_at, updated_at
      FROM users 
      WHERE email = $1 AND is_active = true
    `, [email]);
    
    if (userResult.rows.length === 0) {
      throw new Error('Invalid email or password');
    }
    
    const user = userResult.rows[0];
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }
    
    // Create new session
    const result = await db.transaction(async (client) => {
      // Clean up old sessions for this user
      await client.query(`
        UPDATE sessions 
        SET is_active = false 
        WHERE user_id = $1 AND (expires_at < CURRENT_TIMESTAMP OR is_active = true)
      `, [user.id]);
      
      // Generate new session
      const sessionToken = generateSessionToken();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
      
      const sessionResult = await client.query(`
        INSERT INTO sessions (user_id, token, expires_at, is_active)
        VALUES ($1, $2, $3, true)
        RETURNING id
      `, [user.id, sessionToken, expiresAt]);
      
      const sessionId = sessionResult.rows[0].id;
      
      // Update last sign in
      await client.query(`
        UPDATE users 
        SET last_sign_in_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
      `, [user.id]);
      
      return {
        user: {
          id: user.id,
          email: user.email,
          isAdmin: user.is_admin,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        },
        token: sessionToken,
        sessionId
      };
    });
    
    console.log(`✅ User logged in successfully: ${email}`);
    return result;
    
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Validate session token
 */
export async function validateSession(token: string): Promise<User | null> {
  try {
    if (!token) {
      return null;
    }
    
    // Query session with user data
    const result = await db.query(`
      SELECT 
        u.id, u.email, u.is_admin, u.created_at, u.updated_at,
        s.expires_at
      FROM sessions s
      JOIN users u ON s.user_id = u.id
      WHERE s.token = $1 
        AND s.is_active = true 
        AND s.expires_at > CURRENT_TIMESTAMP
        AND u.is_active = true
    `, [token]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const data = result.rows[0];
    
    return {
      id: data.id,
      email: data.email,
      isAdmin: data.is_admin,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
    
  } catch (error) {
    console.error('Session validation error:', error);
    return null;
  }
}

/**
 * Logout user
 */
export async function logoutUser(token: string): Promise<boolean> {
  try {
    const result = await db.query(`
      UPDATE sessions 
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
      WHERE token = $1
    `, [token]);
    
    return result.rowCount > 0;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const result = await db.query(`
      SELECT id, email, is_admin, created_at, updated_at
      FROM users 
      WHERE id = $1 AND is_active = true
    `, [userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      isAdmin: user.is_admin,
      createdAt: user.created_at,
      updatedAt: user.updated_at
    };
  } catch (error) {
    console.error('Error getting user by ID:', error);
    return null;
  }
}

/**
 * Cleanup expired sessions
 */
export async function cleanupExpiredSessions(): Promise<number> {
  try {
    const result = await db.query(`
      DELETE FROM sessions 
      WHERE expires_at < CURRENT_TIMESTAMP OR is_active = false
    `);
    
    return result.rowCount;
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return 0;
  }
}

const authService = {
  registerUser,
  loginUser,
  validateSession,
  logoutUser,
  getUserById,
  cleanupExpiredSessions
};

export default authService;
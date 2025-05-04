/**
 * jwt.ts - JWT utilities for authentication
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import jwt from 'jsonwebtoken';

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'default-development-secret';

// JWT expiration time (default: 1 hour)
const JWT_EXPIRATION = process.env.JWT_EXPIRATION 
  ? parseInt(process.env.JWT_EXPIRATION, 10) 
  : 3600; // 1 hour in seconds

// Refresh token expiration time (default: 7 days)
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION 
  ? parseInt(process.env.REFRESH_TOKEN_EXPIRATION, 10) 
  : 604800; // 7 days in seconds

// User interface for JWT payload
interface UserPayload {
  id: string;
  email: string;
  isAdmin?: boolean;
}

/**
 * Generate a JWT token for a user
 * @param user - User payload
 * @returns JWT token
 */
export const generateToken = (user: UserPayload): string => {
  const payload = {
    sub: user.id,
    email: user.email,
    isAdmin: user.isAdmin || false,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  });
};

/**
 * Generate a refresh token (longer lived)
 * @param userId - User ID
 * @returns Refresh token
 */
export const generateRefreshToken = (userId: string): string => {
  const payload = {
    sub: userId,
    type: 'refresh',
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });
};

/**
 * Verify a JWT token
 * @param token - JWT token
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

/**
 * Decode a JWT token without verification
 * @param token - JWT token
 * @returns Decoded token payload or null if invalid
 */
export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
};

/**
 * Get the user ID from a JWT token
 * @param token - JWT token
 * @returns User ID or null if invalid
 */
export const getUserIdFromToken = (token: string): string | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    return decoded.sub;
  } catch (error) {
    return null;
  }
};

/**
 * Check if a token is expired
 * @param token - JWT token
 * @returns True if the token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwt.decode(token) as { exp: number };
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export default {
  generateToken,
  generateRefreshToken,
  verifyToken,
  decodeToken,
  getUserIdFromToken,
  isTokenExpired,
};

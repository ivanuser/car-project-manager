/**
 * password.ts - Password utilities for authentication (Updated)
 * Simplified and consistent password handling
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// Number of rounds for bcrypt hashing
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

/**
 * Hash a password using bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Verify a password against a hash
 */
export const verifyPassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Generate a secure random token
 */
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate a random salt (for legacy support)
 */
export const generateSalt = (length: number = 16): string => {
  return crypto.randomBytes(length).toString('hex');
};

export default {
  hashPassword,
  verifyPassword,
  generateToken,
  generateSalt,
};

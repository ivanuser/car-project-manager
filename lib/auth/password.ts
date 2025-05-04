/**
 * password.ts - Password utilities for authentication
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// Number of rounds for bcrypt hashing
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

/**
 * Generate a random salt
 * @returns Random salt string
 */
export const generateSalt = (length: number = 16): string => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash a password using bcrypt
 * @param password - The plain text password
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(password, salt);
};

/**
 * Compare a password with a hash
 * @param password - The plain text password
 * @param hash - The hashed password
 * @returns True if the password matches the hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

/**
 * Hash a password with a custom salt (for database storage)
 * @param password - The plain text password
 * @param salt - Custom salt string
 * @returns Hashed password
 */
export const hashPasswordWithSalt = (
  password: string,
  salt: string
): string => {
  return crypto
    .createHmac('sha256', salt)
    .update(password)
    .digest('hex');
};

/**
 * Generate a secure random token
 * @param length - Length of the token in bytes (default: 32)
 * @returns Random token string
 */
export const generateToken = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export default {
  generateSalt,
  hashPassword,
  comparePassword,
  hashPasswordWithSalt,
  generateToken,
};

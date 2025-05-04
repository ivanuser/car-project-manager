/**
 * index.ts - Authentication module exports
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

// Import client-safe modules
import jwtUtils from './jwt';
import passwordUtils from './password';
import authMiddleware from './middleware';
import clientDb from './db-client';

// Import auth service
import authService from './auth-service';

// Determine if we're on the server or client
const isServer = typeof window === 'undefined';

// Use the appropriate database implementation
// We need to avoid importing './db' on the client side at all costs
const db = isServer ? 
  // Dynamic import for server-side only
  // This prevents the pg module from being bundled with client code
  (async () => {
    if (isServer) {
      try {
        const { default: serverDb } = await import('./db');
        return serverDb;
      } catch (error) {
        console.error('Error importing server database module:', error);
        return clientDb;
      }
    }
    return clientDb;
  })().catch(() => clientDb) : 
  clientDb;

// Export all auth components
export {
  db,
  authService,
  jwtUtils,
  passwordUtils,
  authMiddleware,
};

// Export interfaces from auth-service
export type {
  User,
  RegistrationData,
  LoginData,
  AuthResult,
} from './auth-service';

// Export default as a combination of all modules
export default {
  db: clientDb, // Always use client-safe db in default export
  auth: authService,
  jwt: jwtUtils,
  password: passwordUtils,
  middleware: authMiddleware,
};

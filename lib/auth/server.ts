/**
 * server.ts - Server-side authentication exports
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

// This file contains exports that should only be used on the server
// to prevent including database modules on the client side.

// Force server-side only import
import 'server-only';

// Import server components
import db from './db';
import authService from './auth-service';
import jwtUtils from './jwt';
import passwordUtils from './password';
import authMiddleware from './middleware';

// Re-export everything for server-side use
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
  db,
  auth: authService,
  jwt: jwtUtils,
  password: passwordUtils,
  middleware: authMiddleware,
};

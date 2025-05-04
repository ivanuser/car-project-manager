/**
 * index.ts - Authentication module exports
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import db from './db';
import authService from './auth-service';
import jwtUtils from './jwt';
import passwordUtils from './password';
import authMiddleware from './middleware';

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
  db,
  auth: authService,
  jwt: jwtUtils,
  password: passwordUtils,
  middleware: authMiddleware,
};

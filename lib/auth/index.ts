/**
 * index.ts - Authentication module exports
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

// Import only client-safe modules for browser
import jwtUtils from './jwt';
import passwordUtils from './password';
import clientAuth from './client';

// Server-side modules (only available on server)
let authService: any = null;
let authMiddleware: any = null;

// Dynamically import server-side modules
if (typeof window === 'undefined') {
  try {
    // Import server-side auth modules
    authService = require('./auth-service').default;
    authMiddleware = require('./middleware').default;
  } catch (error) {
    console.error('Error importing server-side auth modules:', error);
    // Provide fallback implementations
    authService = {
      getUserById: async () => null,
      getUserByEmail: async () => null,
      registerUser: async () => { throw new Error('Auth service not available'); },
      loginUser: async () => { throw new Error('Auth service not available'); },
      logoutUser: async () => false,
      refreshAuth: async () => { throw new Error('Auth service not available'); },
      requestPasswordReset: async () => null,
      resetPassword: async () => false,
      changePassword: async () => false,
      validateSession: async () => null,
      isAdmin: async () => false,
    };
    authMiddleware = {
      getToken: () => null,
      getRefreshToken: () => null,
      requireAuth: async () => null,
      setAuthCookies: (response: any) => response,
      clearAuthCookies: (response: any) => response,
    };
  }
}

// Export client-safe modules
export {
  jwtUtils,
  passwordUtils,
  clientAuth,
  authService,
  authMiddleware,
};

// Export client-safe types
export type {
  User,
} from './client';

// Export server-side types if available
export type {
  User as AuthUser,
  RegistrationData,
  LoginData,
  AuthResult,
} from './auth-service';

// Export default as client-safe modules
export default {
  jwt: jwtUtils,
  password: passwordUtils,
  client: clientAuth,
  service: authService,
  middleware: authMiddleware,
};

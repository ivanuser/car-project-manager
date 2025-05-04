/**
 * index.ts - Authentication module exports
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

// Import only client-safe modules
import jwtUtils from './jwt';
import passwordUtils from './password';
import clientAuth from './client';

// Export client-safe modules
export {
  jwtUtils,
  passwordUtils,
  clientAuth,
};

// Export client-safe types
export type {
  User,
} from './client';

// Export default as client-safe modules
export default {
  jwt: jwtUtils,
  password: passwordUtils,
  client: clientAuth,
};

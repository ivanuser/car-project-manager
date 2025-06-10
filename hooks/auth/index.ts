/**
 * index.ts - Authentication hooks exports
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { useAuth } from './useAuth';
import { AuthProvider, useAuthContext } from './AuthProvider';

// Export hooks and components
export { useAuth, AuthProvider, useAuthContext };

// Export interfaces
export type {
  User,
  LoginData,
  RegistrationData,
  Session,
  UseAuthResult,
} from './useAuth';

// Default export
export default {
  useAuth,
  AuthProvider,
  useAuthContext,
};

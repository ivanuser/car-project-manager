/**
 * server-only.ts - Server-side only auth utilities
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

// This is a placeholder file that will be imported dynamically on the server
// It will never be imported on the client side

import 'server-only';

// Export a function that indicates this is server-only
export const isServerSide = () => true;

// We'll dynamically import any modules that use the pg library
export const importServerModules = async () => {
  try {
    // Dynamic imports to avoid bundling with client code
    const authService = await import('./auth-service');
    const db = await import('./db');
    const middleware = await import('./middleware');
    
    return {
      authService: authService.default,
      db: db.default,
      middleware: middleware.default,
    };
  } catch (error) {
    console.error('Failed to import server modules:', error);
    throw error;
  }
};

export default {
  isServerSide,
  importServerModules,
};

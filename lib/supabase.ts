/**
 * Supabase.ts - Compatibility layer for migrated PostgreSQL application
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 * 
 * This file provides compatibility for any components still expecting Supabase
 * It forwards all calls to our custom auth-client implementation that works with direct PostgreSQL
 */

import authClient from './auth/auth-client';
import { createPostgresClient } from './postgres/postgres-client';

// Use our PostgreSQL client for database operations
export const createServerClient = async () => {
  const postgresClient = await createPostgresClient();
  return postgresClient;
};

export const createBrowserClient = async () => {
  const postgresClient = await createPostgresClient();
  return postgresClient;
};

// Export a singleton instance for client-side usage (compatibility)
export const supabase = null; // We'll initialize this lazily when needed

// Re-export createClient for backward compatibility with a different name
export const createCompatClient = async () => {
  const postgresClient = await createPostgresClient();
  return postgresClient;
};

// This ensures any components still expecting Supabase will continue to work
export default {
  createServerClient,
  createBrowserClient,
  supabase,
  createCompatClient
};

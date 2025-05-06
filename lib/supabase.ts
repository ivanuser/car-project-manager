/**
 * Supabase.ts - Compatibility layer for migrated PostgreSQL application
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 * 
 * This file provides compatibility for any components still expecting Supabase
 * It forwards all calls to our custom auth-client implementation that works with direct PostgreSQL
 */

import authClient from './auth/auth-client';

// Use the implementation from our custom auth client
export const createServerClient = authClient.createServerClient;
export const createBrowserClient = authClient.createServerClient;

// Export a singleton instance for client-side usage (compatibility)
export const supabase = typeof window !== "undefined" ? authClient.createServerClient() : null;

// Re-export createClient for backward compatibility with a different name
export const createCompatClient = authClient.createServerClient;

// This ensures any components still expecting Supabase will continue to work
export default {
  createServerClient,
  createBrowserClient,
  supabase,
  createCompatClient
};

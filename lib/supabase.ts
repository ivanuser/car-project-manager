/**
 * Supabase.ts - Legacy compatibility stub
 * This file exists to prevent import errors from old code that still references Supabase
 * All functionality has been migrated to direct PostgreSQL and should use the appropriate actions
 */

// Stub functions that throw errors to prevent accidental usage
export const createServerClient = () => {
  throw new Error("Supabase has been removed. Use PostgreSQL actions instead.")
}

export const createBrowserClient = () => {
  throw new Error("Supabase has been removed. Use PostgreSQL actions instead.")
}

export const supabase = null

export const createCompatClient = () => {
  throw new Error("Supabase has been removed. Use PostgreSQL actions instead.")
}

export default {
  createServerClient,
  createBrowserClient,
  supabase,
  createCompatClient
}

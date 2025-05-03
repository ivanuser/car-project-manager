import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Get environment variables with fallbacks for development/preview
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Log warning instead of crashing in development/preview
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are missing. Authentication and database features will not work properly. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.",
  )
}

// Client-side singleton pattern
let supabaseClient: ReturnType<typeof createSupabaseClient<Database>> | null = null

// Create a browser client (for client components)
export const createBrowserClient = () => {
  if (supabaseClient) return supabaseClient

  supabaseClient = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  })

  return supabaseClient
}

// Create a server-side supabase client (for server components and server actions)
export const createServerClient = () => {
  // For server-side, we always create a new instance to avoid sharing state
  const options = {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
  
  // For safety, we use the anon key for server components instead of service role key
  // The service role key should only be used for admin operations or direct database access
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, options)
}

// Export a singleton instance for client-side usage
export const supabase = typeof window !== "undefined" ? createBrowserClient() : null

// Re-export createClient for backward compatibility
// This should be a function that includes the URL and key, not just the raw function
export const createClient = () => {
  return createServerClient()
}

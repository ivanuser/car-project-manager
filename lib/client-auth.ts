import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Get environment variables with fallbacks for development/preview
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Create a client specifically for authentication
// This client is designed to be used in client components
export const createAuthClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase credentials - Authentication will not work")
    throw new Error("Missing required environment variables for authentication")
  }
  
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    }
  })
}

// Export a singleton instance that can be used throughout the app
let clientInstance: ReturnType<typeof createClient<Database>> | null = null

export const getClient = () => {
  if (typeof window === 'undefined') {
    throw new Error('getClient should only be used in client components')
  }
  
  if (!clientInstance) {
    clientInstance = createAuthClient()
  }
  
  return clientInstance
}

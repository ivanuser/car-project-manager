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
      storageKey: 'supabase-auth',
      storage: {
        getItem: (key) => {
          if (typeof window === 'undefined') return null
          return window.localStorage.getItem(key)
        },
        setItem: (key, value) => {
          if (typeof window === 'undefined') return
          window.localStorage.setItem(key, value)
        },
        removeItem: (key) => {
          if (typeof window === 'undefined') return
          window.localStorage.removeItem(key)
        },
      },
      detectSessionInUrl: true,
      flowType: 'pkce',
    }
  })
}

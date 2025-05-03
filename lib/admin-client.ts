import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Get environment variables with fallbacks for development/preview
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// Create an admin client that can bypass RLS
export function createAdminClient() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("Missing Supabase credentials for admin client")
    throw new Error("Missing required environment variables for admin operations")
  }
  
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

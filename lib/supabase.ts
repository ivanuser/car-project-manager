import { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Log warning if missing config
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase environment variables are missing. Authentication and database features will not work properly."
  );
}

// Create a browser client for client components using auth-helpers-nextjs
export const createBrowserClient = () => {
  return createClientComponentClient<Database>({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
    options: {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  });
};

// Create a standard client for server contexts without cookies
export const createServerClient = () => {
  return supabaseCreateClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Export a singleton instance for client-side usage
export const supabase = typeof window !== "undefined" ? createBrowserClient() : null;

// Re-export createClient for backward compatibility with a different name
export const createCompatClient = () => {
  return createServerClient();
};

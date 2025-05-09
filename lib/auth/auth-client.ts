/**
 * Auth client to replace Supabase auth functionality
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

// Conditional imports to avoid server components issues
const getServerComponents = () => {
  if (typeof window === 'undefined') {
    // Only import on server-side
    const { cookies } = require('next/headers');
    const jwtUtils = require('@/lib/auth/jwt').default;
    return { cookies, jwtUtils };
  }
  return { cookies: null, jwtUtils: null };
};

// Types for compatibility with previous Supabase usage
interface User {
  id: string;
  email: string;
  isAdmin?: boolean;
}

interface UserResponse {
  data: {
    user: User | null;
  };
  error?: any;
}

interface SignInResponse {
  data: {
    user: User | null;
    session?: any;
  };
  error?: any;
}

interface AuthClient {
  auth: {
    getUser: () => Promise<UserResponse>;
    signOut: () => Promise<{ error: any }>;
    signInWithPassword: (credentials: { email: string; password: string }) => Promise<SignInResponse>;
    signUp: (credentials: { email: string; password: string }) => Promise<SignInResponse>;
  };
}

/**
 * Get the current user from the auth token
 * @returns User object or null if not authenticated
 */
export async function getUser(): Promise<UserResponse> {
  try {
    if (typeof window === 'undefined') {
      // Server-side execution
      const { cookies, jwtUtils } = getServerComponents();
      const authToken = cookies().get('cajpro_auth_token')?.value;
      
      if (!authToken) {
        console.log("No auth token found in cookies");
        
        // For development mode only
        if (process.env.NODE_ENV === 'development') {
          return {
            data: {
              user: {
                id: 'admin-dev-mode',
                email: 'admin@cajpro.local',
                isAdmin: true
              }
            }
          };
        }
        
        return { data: { user: null } };
      }
      
      // Validate token and get user ID
      const payload = jwtUtils.verifyToken(authToken);
      if (!payload) {
        console.log("Invalid auth token");
        return { data: { user: null } };
      }
      
      // Check if token is expired
      if (jwtUtils.isTokenExpired(authToken)) {
        console.log("Auth token expired");
        return { data: { user: null } };
      }
      
      // Extract user info from payload
      const email = payload.email;
      const userId = payload.sub;
      const isAdmin = payload.isAdmin;
      
      // Return user object in format similar to Supabase for compatibility
      return {
        data: {
          user: {
            id: userId,
            email,
            isAdmin
          }
        }
      };
    } else {
      // Client-side execution - call the API endpoint
      const response = await fetch('/api/auth/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        // Check for dev mode on client
        if (process.env.NODE_ENV === 'development' && 
            localStorage && 
            localStorage.getItem('cajpro_dev_mode') === 'admin') {
          return {
            data: {
              user: {
                id: 'admin-dev-mode',
                email: 'admin@cajpro.local',
                isAdmin: true
              }
            }
          };
        }
        
        return { data: { user: null } };
      }
      
      const data = await response.json();
      return { data: { user: data.user } };
    }
  } catch (error) {
    console.error("Error getting user:", error);
    return { data: { user: null } };
  }
}

/**
 * Sign in with email and password
 * @param credentials User credentials
 * @returns Sign in response
 */
export async function signInWithPassword(credentials: { email: string; password: string }): Promise<SignInResponse> {
  try {
    // Client-side only - call the API endpoint
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        data: { user: null },
        error: errorData.error || "Invalid email or password"
      };
    }
    
    const data = await response.json();
    return {
      data: {
        user: data.user,
        session: data.session
      }
    };
  } catch (error) {
    console.error("Error signing in:", error);
    return {
      data: { user: null },
      error: (error as Error).message
    };
  }
}

/**
 * Sign up with email and password
 * @param credentials User credentials
 * @returns Sign up response
 */
export async function signUp(credentials: { email: string; password: string }): Promise<SignInResponse> {
  try {
    // Client-side only - call the API endpoint
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        confirmPassword: credentials.password, // Assuming we validate this on the client before sending
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return {
        data: { user: null },
        error: errorData.error || "Registration failed"
      };
    }
    
    const data = await response.json();
    return {
      data: {
        user: data.user,
        session: data.session
      }
    };
  } catch (error) {
    console.error("Error signing up:", error);
    return {
      data: { user: null },
      error: (error as Error).message
    };
  }
}

/**
 * Sign out the current user
 * @returns Success status
 */
export async function signOut() {
  try {
    if (typeof window === 'undefined') {
      // Server-side execution
      const { cookies } = getServerComponents();
      cookies().delete('cajpro_auth_token');
      
      return { error: null };
    } else {
      // Client-side execution - call the API endpoint
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const data = await response.json();
        return { error: data.error || 'Failed to sign out' };
      }
      
      return { error: null };
    }
  } catch (error) {
    console.error("Error signing out:", error);
    return { error: (error as Error).message };
  }
}

/**
 * Create auth client for server-side auth operations
 * This is a compatibility function to replace createServerClient
 */
export async function createServerClient(): Promise<AuthClient> {
  return {
    auth: {
      getUser,
      signOut,
      signInWithPassword,
      signUp
    }
  };
}

// Export default object with async functions
export default {
  createServerClient,
  getUser,
  signOut,
  signInWithPassword,
  signUp
};

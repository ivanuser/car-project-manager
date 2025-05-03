import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Get all cookies for debugging
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    const cookieDetails = allCookies.map(cookie => ({
      name: cookie.name,
      value: cookie.name.includes('token') ? '[REDACTED]' : cookie.value.substring(0, 30) + (cookie.value.length > 30 ? '...' : ''),
      path: cookie.path,
      expires: cookie.expires
    }))
    
    // Check if Supabase auth cookie exists
    const supabaseAuthCookie = cookieStore.get("sb-access-token") || 
                              cookieStore.get("sb-refresh-token") || 
                              cookieStore.get("supabase-auth-token")
    
    // Check if NextAuth cookies exist
    const nextAuthCookies = allCookies.filter(c => c.name.startsWith('next-auth'))
    
    // Initialize Supabase client
    const supabase = createServerClient()
    
    // Get session information
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    
    // Get user information
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    // Prepare debug data
    const debugData = {
      time: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not set'
      },
      cookies: {
        count: allCookies.length,
        details: cookieDetails,
        supabaseAuthExists: !!supabaseAuthCookie,
        nextAuthExists: nextAuthCookies.length > 0
      },
      session: {
        exists: !!sessionData?.session,
        sessionId: sessionData?.session?.id ? sessionData.session.id.substring(0, 8) + '...' : null,
        expiresAt: sessionData?.session?.expires_at ? new Date(sessionData.session.expires_at * 1000).toISOString() : null,
        error: sessionError ? sessionError.message : null
      },
      user: {
        exists: !!userData?.user,
        email: userData?.user?.email || null,
        id: userData?.user?.id ? userData.user.id.substring(0, 8) + '...' : null,
        error: userError ? userError.message : null
      }
    }

    // Serve an HTML page with the debug information
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Auth Debug</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .card {
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 1.5rem;
    }
    h1, h2 {
      margin-top: 0;
      color: #333;
    }
    .status {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: bold;
    }
    .status-success {
      background: #e8f5e9;
      color: #2e7d32;
    }
    .status-error {
      background: #ffebee;
      color: #c62828;
    }
    .section {
      margin-bottom: 1.5rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #eee;
    }
    .section:last-child {
      border-bottom: none;
      margin-bottom: 0;
      padding-bottom: 0;
    }
    pre {
      background: #f5f5f5;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      font-size: 0.9rem;
    }
    .button {
      background: #2196f3;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      text-decoration: none;
      display: inline-block;
      margin-right: 0.5rem;
    }
    .button-reset {
      background: #f44336;
    }
    .button:hover {
      opacity: 0.9;
    }
    .action-buttons {
      margin-top: 1rem;
      display: flex;
      gap: 1rem;
    }
    #clientDebugInfo {
      margin-top: 1rem;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Authentication Debug</h1>
    
    <div class="section">
      <h2>Status</h2>
      <div>
        <span class="status ${userData?.user ? 'status-success' : 'status-error'}">
          ${userData?.user ? '✓ Authenticated' : '✕ Not Authenticated'}
        </span>
        ${userData?.user ? `as <strong>${userData.user.email}</strong>` : ''}
      </div>
      
      <div class="action-buttons">
        <a href="/login" class="button">Go to Login</a>
        <a href="/api/auth/reset" class="button button-reset">Reset Auth</a>
      </div>
    </div>
    
    <div class="section">
      <h2>Server Auth Details</h2>
      <pre>${JSON.stringify(debugData, null, 2)}</pre>
    </div>
    
    <div class="section">
      <h2>Client Auth Details</h2>
      <button onclick="checkClientAuth()" class="button">Check Client-Side Auth</button>
      <div id="clientDebugInfo">
        <em>Click the button above to check client-side authentication state</em>
      </div>
    </div>
  </div>
  
  <script>
    async function checkClientAuth() {
      const debugEl = document.getElementById('clientDebugInfo');
      debugEl.innerHTML = '<em>Checking client-side auth state...</em>';
      
      try {
        // Gather data from localStorage and sessionStorage
        const storage = {
          localStorage: {},
          sessionStorage: {}
        };
        
        // Check localStorage
        if (typeof localStorage !== 'undefined') {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              // Redact token values but show they exist
              if (key.includes('token') || key.includes('auth')) {
                storage.localStorage[key] = '[REDACTED]';
              } else {
                let value = localStorage.getItem(key);
                // Truncate long values
                if (value && value.length > 50) {
                  value = value.substring(0, 50) + '...';
                }
                storage.localStorage[key] = value;
              }
            }
          }
        }
        
        // Check sessionStorage
        if (typeof sessionStorage !== 'undefined') {
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key) {
              // Redact token values but show they exist
              if (key.includes('token') || key.includes('auth')) {
                storage.sessionStorage[key] = '[REDACTED]';
              } else {
                let value = sessionStorage.getItem(key);
                // Truncate long values
                if (value && value.length > 50) {
                  value = value.substring(0, 50) + '...';
                }
                storage.sessionStorage[key] = value;
              }
            }
          }
        }
        
        // Fetch current auth status from client
        let supabaseAuth = null;
        try {
          // Try to dynamically import the Supabase client
          const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
          
          // Use the NEXT_PUBLIC environment variables from the server response
          const supabaseUrl = '${process.env.NEXT_PUBLIC_SUPABASE_URL}';
          const supabaseAnonKey = '${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}';
          
          if (supabaseUrl && supabaseAnonKey) {
            const supabase = createClient(supabaseUrl, supabaseAnonKey, {
              auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
              }
            });
            
            const { data, error } = await supabase.auth.getSession();
            if (error) {
              supabaseAuth = { error: error.message };
            } else {
              supabaseAuth = {
                hasSession: !!data.session,
                user: data.session?.user?.email || null,
                expiresAt: data.session?.expires_at 
                  ? new Date(data.session.expires_at * 1000).toISOString()
                  : null
              };
            }
          } else {
            supabaseAuth = { error: 'Missing Supabase configuration' };
          }
        } catch (e) {
          supabaseAuth = { error: e.message };
        }
        
        // Display all the data
        const clientDebug = {
          time: new Date().toISOString(),
          browserStorage: storage,
          supabaseClientAuth: supabaseAuth
        };
        
        debugEl.innerHTML = \`<pre>\${JSON.stringify(clientDebug, null, 2)}</pre>\`;
      } catch (e) {
        debugEl.innerHTML = \`<div class="status-error">Error checking client auth: \${e.message}</div>\`;
      }
    }
  </script>
</body>
</html>
    `
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html'
      }
    })
  } catch (error) {
    console.error("Error in auth debug route:", error)
    return NextResponse.json({
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

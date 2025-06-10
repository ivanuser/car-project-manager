// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth/current-user"

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
    
    // Check for our auth token
    const authCookie = cookieStore.get("auth-token") || 
                       cookieStore.get("cajpro_auth_token")
    
    // Get user information using our auth system
    const currentUser = await getCurrentUser()
    
    // Prepare debug data
    const debugData = {
      time: new Date().toISOString(),
      env: {
        nodeEnv: process.env.NODE_ENV,
        siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'not set'
      },
      cookies: {
        count: allCookies.length,
        details: cookieDetails,
        authTokenExists: !!authCookie
      },
      user: {
        exists: !!currentUser,
        email: currentUser?.email || null,
        id: currentUser?.userId ? currentUser.userId.substring(0, 8) + '...' : null
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
        <span class="status ${currentUser ? 'status-success' : 'status-error'}">
          ${currentUser ? '✓ Authenticated' : '✕ Not Authenticated'}
        </span>
        ${currentUser ? `as <strong>${currentUser.email}</strong>` : ''}
      </div>
      
      <div class="action-buttons">
        <a href="/login" class="button">Go to Login</a>
        <a href="/api/auth/logout" class="button button-reset">Logout</a>
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
        
        // Display all the data
        const clientDebug = {
          time: new Date().toISOString(),
          browserStorage: storage
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

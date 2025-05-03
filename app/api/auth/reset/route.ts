import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    // Get all cookies
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    
    // Track deleted cookies
    const deletedCookies: string[] = []
    
    // Delete all auth-related cookies
    for (const cookie of allCookies) {
      if (
        cookie.name.startsWith('next-auth') || 
        cookie.name.startsWith('sb-') || 
        cookie.name.includes('supabase') ||
        cookie.name.includes('auth')
      ) {
        try {
          cookieStore.delete(cookie.name)
          deletedCookies.push(cookie.name)
          console.log(`Deleted cookie: ${cookie.name}`)
        } catch (e) {
          console.error(`Failed to delete cookie ${cookie.name}:`, e)
        }
      }
    }
    
    // Try to sign out from Supabase
    const supabase = createServerClient()
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out from Supabase:", error)
    } else {
      console.log("Successfully signed out from Supabase")
    }
    
    // Serve an HTML page with a script to clear client-side storage
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Auth Reset</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 2rem;
      max-width: 600px;
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
    h1 {
      margin-top: 0;
      color: #333;
    }
    .status {
      font-weight: bold;
      margin: 1rem 0;
    }
    .info {
      color: #666;
      font-size: 0.9rem;
    }
    .deleted-cookies {
      background: #f5f5f5;
      padding: 0.5rem;
      border-radius: 4px;
      margin-top: 0.5rem;
      max-height: 200px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 0.8rem;
    }
    .success {
      color: #4caf50;
    }
    .warning {
      color: #ff9800;
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
      margin-top: 1rem;
    }
    .button:hover {
      background: #1976d2;
    }
  </style>
</head>
<body>
  <div class="card">
    <h1>Authentication Reset</h1>
    <p class="status">Server-side auth state cleared</p>
    <p>Server-side cookies cleared: <strong>${deletedCookies.length}</strong></p>
    
    <div class="info">
      <p>Deleted cookies:</p>
      <div class="deleted-cookies">
        ${deletedCookies.length > 0 
          ? deletedCookies.map(c => `- ${c}`).join('<br>')
          : 'No auth cookies found to delete'
        }
      </div>
    </div>
    
    <p class="status" id="status">Clearing client-side auth state...</p>
    
    <a href="/login" class="button">Go to Login</a>
  </div>
  
  <script>
    // This script will clear all client-side authentication state
    
    // Clear localStorage
    if (typeof localStorage !== 'undefined') {
      // Clear all Supabase auth-related items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.includes('supabase') || 
          key.includes('sb-') || 
          key.includes('auth') ||
          key.startsWith('next-auth')
        )) {
          keysToRemove.push(key);
        }
      }
      
      // Remove the keys we found
      keysToRemove.forEach(key => {
        console.log('Removing from localStorage:', key);
        localStorage.removeItem(key);
      });
      
      // Also clear our custom backup items
      localStorage.removeItem('supabase-auth-user-email');
      localStorage.removeItem('supabase-auth-user-id');
    }
    
    // Clear sessionStorage
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.clear();
      console.log('SessionStorage cleared');
    }
    
    // Inform the user
    document.getElementById('status').innerHTML = '<span class="success">✅ Client-side auth state cleared!</span>';
  </script>
</body>
</html>
    `
    
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        // Clear any auth cookies in the response as well
        'Set-Cookie': deletedCookies.map(name => 
          `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Lax`
        ).join(', ')
      }
    })
  } catch (error) {
    console.error("Error in auth reset route:", error)
    return NextResponse.json({
      error: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

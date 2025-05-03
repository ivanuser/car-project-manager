import { NextResponse } from "next/server";

// This route returns HTML with a script to clear client-side storage
export async function GET() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Auth Reset</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .card {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }
        h1 {
          color: #2563eb;
        }
        pre {
          background: #f1f5f9;
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
        }
        .success {
          color: #10b981;
          font-weight: bold;
        }
        .button {
          display: inline-block;
          background: #2563eb;
          color: white;
          padding: 8px 16px;
          border-radius: 4px;
          text-decoration: none;
          margin-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Auth Reset</h1>
        <div id="status">Clearing authentication data...</div>
        <pre id="log"></pre>
        <a href="/login" class="button">Go to Login</a>
      </div>

      <script>
        const log = document.getElementById('log');
        const status = document.getElementById('status');
        
        function appendLog(message) {
          log.textContent += message + '\\n';
        }
        
        async function resetAuth() {
          try {
            // Clear localStorage
            appendLog('Clearing localStorage...');
            const localStorageCount = localStorage.length;
            localStorage.clear();
            appendLog(\`Cleared \${localStorageCount} localStorage items\`);
            
            // Clear sessionStorage
            appendLog('Clearing sessionStorage...');
            const sessionStorageCount = sessionStorage.length;
            sessionStorage.clear();
            appendLog(\`Cleared \${sessionStorageCount} sessionStorage items\`);
            
            // Call the server reset endpoint
            appendLog('Sending server reset request...');
            const response = await fetch('/api/auth/reset');
            const data = await response.json();
            
            appendLog(\`Server response: \${JSON.stringify(data, null, 2)}\`);
            status.innerHTML = '<span class="success">Authentication data cleared successfully</span>';
            
            appendLog('Complete! You can now go to the login page.');
          } catch (error) {
            appendLog(\`Error: \${error.message}\`);
            status.innerHTML = \`<span style="color: red">Error: \${error.message}</span>\`;
          }
        }
        
        // Run the reset
        resetAuth();
      </script>
    </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}

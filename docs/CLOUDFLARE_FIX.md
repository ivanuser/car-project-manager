# Cloudflare Tunnel Fix for Next.js with PostgreSQL

## Overview of the Problem

The error `Reading from "cloudflare:sockets" is not handled by plugins (Unhandled scheme)` occurs because the PostgreSQL client (`pg` module) is trying to use Cloudflare's socket mechanism, but webpack doesn't know how to handle this URI scheme during bundling.

## Solution Approach

Our solution completely separates client-side and server-side code to ensure that the `pg` module is never loaded on the client side:

1. **Client/Server Separation**: Created distinct client-safe and server-only modules
2. **Dynamic Server Imports**: Using dynamic imports and the 'server-only' package
3. **Webpack Configuration**: Added special handling for problematic modules
4. **API Helpers**: Created helper functions for API routes to safely import server modules

## How to Apply the Fix

1. **Install Required Dependencies**:
   ```bash
   npm install --save-dev null-loader
   npm install server-only
   ```

2. **Clear Next.js Cache**:
   ```bash
   rm -rf .next
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```

## Code Changes Explained

### 1. Client-Side Auth Module
Created a client-side only auth module that doesn't depend on pg, using API calls to handle server actions.

### 2. Server-Only Module
Created a server-only module with dynamic imports to prevent client-side loading.

### 3. Next.js Configuration
Updated webpack configuration to block problematic modules and provide fallbacks.

### 4. API Route Helpers
Created helpers for API routes to safely import server-side modules.

### 5. Middleware Update
Simplified middleware to avoid importing server-only modules.

## Debugging Tips

If you still encounter issues:

1. Check browser console for specific errors
2. Examine webpack bundling logs
3. Try disabling specific modules in next.config.mjs

For persistent issues, you can temporarily disable server components with:
```
NEXT_MINIMAL_SERVER_COMPONENTS=true npm run dev
```

## References

- [Next.js Server/Client Component Documentation](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Webpack Module Resolution Documentation](https://webpack.js.org/concepts/module-resolution/)

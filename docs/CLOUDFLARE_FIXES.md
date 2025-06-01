# Cloudflare Integration Fixes for Caj-pro

This document describes the fixes implemented to resolve the "cloudflare:sockets" error when running Caj-pro with Cloudflare tunnels.

## Fix Overview

The main issue was with the PostgreSQL (pg) module trying to use Cloudflare-specific networking features that are not properly handled by Next.js in a development environment. The error occurred specifically in this import chain:

```
cloudflare:sockets
./node_modules/pg-cloudflare/dist/index.js
./node_modules/pg/lib/stream.js
./node_modules/pg/lib/connection.js
./node_modules/pg/lib/index.js
./node_modules/pg/esm/index.mjs
./lib/auth/db.ts
./lib/auth/index.ts
```

## Implemented Fixes

### 1. Webpack Configuration

Updated `next.config.mjs` to:
- Use null-loader for cloudflare:sockets imports
- Use null-loader for pg-native imports
- Add fallbacks for Node.js modules
- Prevent pg module from being bundled on the client side
- Mark pg and related packages as external

### 2. Client/Server Code Separation

Created a proper separation between client and server code:
- `db.ts` - Server-side PostgreSQL implementation
- `db-client.ts` - Client-side mock implementation
- `db-config.ts` - Environment-specific PostgreSQL configuration
- `auth-utils.ts` - Client-safe authentication utilities
- `server.ts` - Server-only exports with 'server-only' package

### 3. Environment-Specific Database Configuration

Added Cloudflare-specific PostgreSQL configuration:
- Disable SSL for local connections through Cloudflare tunnel
- Use individual connection parameters instead of connection string
- Add fallbacks and error handling

### 4. Package Updates

Added necessary dependencies:
- null-loader - For handling unsupported modules
- server-only - For marking server-only imports
- @types for authentication libraries

## How to Use

When working in a Cloudflare tunnel environment:

1. Import client-side auth utilities from the main export:
   ```typescript
   import { useAuthContext } from '@/hooks/auth';
   ```

2. For server-side code (API routes, server components), import from the server module:
   ```typescript
   import { authService } from '@/lib/auth/server';
   ```

3. Make sure your .env.local file has the proper configuration:
   ```
   NEXT_PUBLIC_CLOUDFLARE_TUNNEL=true
   NEXT_PUBLIC_SITE_URL=https://dev.customautojourney.com
   ```

## Potential Issues

If you still encounter issues:

1. Delete the .next directory to clear the cache:
   ```bash
   rm -rf .next
   ```

2. Make sure all dependencies are installed:
   ```bash
   npm install
   ```

3. Check if there are any TypeScript errors:
   ```bash
   npx tsc --noEmit
   ```

4. If using pnpm, install it first:
   ```bash
   npm install -g pnpm
   ```

5. For persistent issues, you may need to temporarily disable the pg module:
   ```bash
   # Add this to .env.local
   SKIP_DB_CONNECTION=true
   ```

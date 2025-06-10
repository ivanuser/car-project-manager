# Cloudflare Integration for Caj-pro

This document explains how to configure Caj-pro to work with a Cloudflare tunnel for development and production use.

## Overview

The Caj-pro application can be configured to work seamlessly with Cloudflare tunnels, which allow you to expose your local development environment to the internet securely through a custom domain (e.g., https://dev.customautojourney.com).

## Configuration

### 1. Fix for "cloudflare:sockets" Error

When running Next.js with a Cloudflare tunnel, you might encounter the following error:

```
Module build failed: UnhandledSchemeError: Reading from "cloudflare:sockets" is not handled by plugins (Unhandled scheme).
Webpack supports "data:" and "file:" URIs by default.
You may need an additional plugin to handle "cloudflare:" URIs.
```

This error occurs because Next.js is trying to use Cloudflare-specific features but doesn't have the right webpack configuration.

### 2. Running the Fix Script

To fix this issue, run the provided script:

```bash
# Make the script executable
chmod +x ./scripts/fix-cloudflare.sh

# Run the script
./scripts/fix-cloudflare.sh
```

This script will:
- Install the necessary `null-loader` package
- Update your Next.js configuration
- Configure environment variables for Cloudflare
- Update cookie settings for cross-domain compatibility

### 3. Manual Configuration (if needed)

If you need to manually configure Cloudflare integration:

1. **Update next.config.mjs**:
   - Add webpack configuration to handle Cloudflare modules
   - Configure fallbacks for Node.js modules not available in Cloudflare Workers

2. **Install dependencies**:
   ```bash
   npm install --save-dev null-loader
   ```

3. **Update environment variables**:
   - Set `NEXT_PUBLIC_SITE_URL` to your Cloudflare tunnel URL
   - Set `NEXT_PUBLIC_CLOUDFLARE_TUNNEL` to `true`

4. **Configure cookies**:
   - Use `secure: true` for all cookies
   - Use `sameSite: 'lax'` for better compatibility with Cloudflare

## Authentication with Cloudflare

When using Cloudflare with our custom authentication system:

1. **Cookie Handling**:
   - All authentication cookies are configured to work with secure HTTPS connections
   - Cookies use `sameSite: 'lax'` for compatibility with Cloudflare tunnels

2. **CORS Considerations**:
   - If you encounter CORS issues, ensure your API routes have the appropriate headers
   - The `Access-Control-Allow-Origin` header should match your Cloudflare domain

3. **Session Management**:
   - Session validation works across domains with the proper cookie configuration
   - JWT tokens can be safely transmitted over Cloudflare's secure connections

## Troubleshooting

If you encounter issues with Cloudflare integration:

1. **Check Next.js and Cloudflare Versions**:
   - Ensure your Next.js version is compatible with Cloudflare
   - Consider updating to the latest version: `npm install next@latest`

2. **Webpack Configuration**:
   - Verify that your next.config.mjs includes the necessary webpack configuration
   - Check that null-loader is properly installed and configured

3. **Cookie Issues**:
   - Make sure cookies are being set with the correct domain
   - Check for secure and SameSite attributes

4. **Network Debugging**:
   - Use browser developer tools to inspect network requests and cookies
   - Verify that requests to your Cloudflare domain are properly authenticated

## Notes for Production

When deploying to production with Cloudflare:

1. **Environment Variables**:
   - Update your production environment variables accordingly
   - Ensure your production domain is set in `NEXT_PUBLIC_SITE_URL`

2. **Cloudflare Workers**:
   - If using Cloudflare Workers, additional configuration may be required
   - Consult the Cloudflare Workers documentation for Next.js compatibility

3. **Performance Optimization**:
   - Leverage Cloudflare's caching capabilities for static assets
   - Configure appropriate cache headers in your Next.js API routes

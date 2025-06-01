# Supabase Removal Guide

This document outlines the changes made to remove Supabase dependencies and replace them with direct PostgreSQL connections.

## Changes Made

1. Removed `@supabase/supabase-js` dependency
2. Updated authentication to use custom PostgreSQL-based JWT auth
3. Replaced Supabase client in components with direct PostgreSQL queries
4. Updated types to reflect direct database schema (types/database.ts)
5. Created compatibility layer for any remaining Supabase references

## Files Updated

- **Dashboard Layout**: Updated to use custom PostgreSQL auth
- **API Routes**: Updated to use direct database queries
- **Authentication**: Using JWT-based authentication directly with PostgreSQL
- **Type Definitions**: Moved from Supabase-specific to general database types

## How to Test

1. Run the cleanup script to remove any remaining Supabase references:
   ```bash
   chmod +x scripts/cleanup-supabase.sh
   ./scripts/cleanup-supabase.sh
   ```

2. Update your `.env.local` file to include:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/cajpro
   JWT_SECRET=your-secret-key
   ```

3. Build and run the application:
   ```bash
   npm run build
   npm run start
   ```

## Development Mode

In development mode, the application will look for an admin user with email `admin@cajpro.local` and fall back to a default admin user if not found. This ensures you can still access the dashboard during development.

## Database Schema

The database schema remains the same, just without the Supabase-specific authentication. We now use a custom `auth` schema with `users` and `sessions` tables for authentication.

## Migration Notes

If you encounter any issues with authentication, run the fix-admin-mode.sh script to set up the admin user:
```bash
chmod +x scripts/fix-admin-mode.sh
./scripts/fix-admin-mode.sh
```

This will ensure the admin user is properly set up in the database and has valid preferences.

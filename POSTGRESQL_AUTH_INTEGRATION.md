# PostgreSQL Authentication Integration Guide

This guide explains how to integrate the new PostgreSQL-based authentication system with your existing Caj-pro application.

## Overview

We've implemented a custom PostgreSQL authentication system to replace Supabase Auth. This system includes:

1. **Database Schema**: Authentication tables and functions in PostgreSQL
2. **Auth Service**: Backend authentication logic
3. **API Routes**: Authentication endpoints for registration, login, etc.
4. **Auth Components**: Frontend components for authentication forms
5. **Auth Hooks**: React hooks for client-side authentication

## Integration Steps

### 1. Remove the Route Group Structure

First, delete the conflicting route group structure that's causing routing errors:

```bash
rm -rf /home/ihoner/dev01/src/car-project-manager/app/(auth)
```

### 2. Replace the Direct Login API Endpoint

```bash
# Backup existing file
mv /home/ihoner/dev01/src/car-project-manager/app/api/auth/direct-login/route.ts \
   /home/ihoner/dev01/src/car-project-manager/app/api/auth/direct-login/route.ts.backup

# Use the new implementation
mv /home/ihoner/dev01/src/car-project-manager/app/api/auth/direct-login/route.ts.new \
   /home/ihoner/dev01/src/car-project-manager/app/api/auth/direct-login/route.ts
```

### 3. Update the Login Page

You have two options:

#### Option A: Use our PostgreSQL Auth Form (Recommended)

1. First, make a backup of your current login page:
   ```bash
   cp /home/ihoner/dev01/src/car-project-manager/app/login/page.tsx \
      /home/ihoner/dev01/src/car-project-manager/app/login/page.tsx.backup
   ```

2. Then modify your login page to add our PostgreSQL auth:
   ```tsx
   // Add this line to your imports
   import { PgAuthForm } from "@/components/auth/pg-auth-form";
   
   // In your login page component, add the PgAuthForm as an option
   // For example:
   <div className="space-y-6">
     <Tabs defaultValue="postgres">
       <TabsList className="grid grid-cols-3">
         <TabsTrigger value="postgres">PostgreSQL Auth</TabsTrigger>
         <TabsTrigger value="supabase">Supabase Auth</TabsTrigger>
         <TabsTrigger value="direct">Direct Login</TabsTrigger>
       </TabsList>
       
       <TabsContent value="postgres">
         <PgAuthForm />
       </TabsContent>
       
       <TabsContent value="supabase">
         <ClientAuthForm />
       </TabsContent>
       
       <TabsContent value="direct">
         <DirectLoginPage />
       </TabsContent>
     </Tabs>
   </div>
   ```

#### Option B: Use the Provided Page

```bash
cp /home/ihoner/dev01/src/car-project-manager/app/login/page.tsx.pg \
   /home/ihoner/dev01/src/car-project-manager/app/login/page.tsx
```

### 4. Update Environment Variables

Make sure your `.env.local` file has the necessary PostgreSQL connection details:

```
# PostgreSQL Database Configuration
DATABASE_URL=postgresql://cajpro:CAJPRO2025@localhost:5432/cajpro
POSTGRES_USER=cajpro
POSTGRES_PASSWORD=CAJPRO2025
POSTGRES_DB=cajpro
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION=604800

# Security Configuration
BCRYPT_SALT_ROUNDS=10
```

### 5. Run the PostgreSQL Setup Scripts

```bash
# Make scripts executable
chmod +x ./scripts/*.sh

# Run setup
./scripts/setup-all.sh
```

## Testing the Integration

1. **Clear Your Cache**: Remove the `.next` directory to clear Next.js cache

```bash
rm -rf .next
```

2. **Start the Development Server**:

```bash
npm run dev
```

3. **Test Authentication**:
   - Try logging in with admin@cajpro.local / admin123
   - Try registering a new user
   - Test the direct login page if you encounter issues

## Troubleshooting

### Fix for Cloudflare Integration

If you have issues with Cloudflare, refer to the `CLOUDFLARE_FIX.md` file for specific fixes.

### Login Issues

If login doesn't work:
1. Check browser console for errors
2. Try the direct-login page which has more detailed error reporting
3. Check server logs for backend errors

### Database Connection Problems

If you have database connection issues:
1. Verify that PostgreSQL is running
2. Check that the connection parameters in `.env.local` are correct
3. Try connecting to the database manually to test:
   ```bash
   psql postgresql://cajpro:CAJPRO2025@localhost:5432/cajpro
   ```

## Next Steps

Once authentication is working correctly:

1. **Update Your Middleware**: Update your middleware to use the new authentication
2. **Migrate User Data**: If you have existing user data in Supabase, migrate it to PostgreSQL
3. **Remove Supabase Dependencies**: Once everything is working, you can remove Supabase dependencies

## Files Created/Modified

- `/lib/auth/` - Authentication library
- `/app/api/auth/` - Authentication API endpoints
- `/components/auth/pg-auth-form.tsx` - PostgreSQL auth form component
- `/app/direct-login/page.tsx` - Direct login page
- `/hooks/auth/useAuth.ts` - Authentication hook

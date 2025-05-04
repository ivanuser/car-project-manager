# Migrating from Supabase to Custom PostgreSQL Authentication

This guide provides step-by-step instructions for migrating from Supabase authentication to our custom PostgreSQL authentication system in the Caj-pro application.

## Migration Steps

### 1. Setup PostgreSQL and Authentication Schema

First, run the setup scripts to install and configure PostgreSQL:

```bash
# Make scripts executable
chmod +x ./scripts/*.sh

# Run the complete setup process
./scripts/setup-all.sh

# Or run individual steps if needed:
./scripts/install-postgres.sh
./scripts/setup-database.sh
./scripts/init-schema.sh
./scripts/update-env.sh
```

### 2. Install Required NPM Packages

Install the necessary packages for the authentication system:

```bash
npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

### 3. Update `.env.local` File

The `update-env.sh` script will create a new `.env.local` file with the necessary environment variables. Make sure it includes:

```
DATABASE_URL=postgresql://cajpro:CAJPRO2025@localhost:5432/cajpro
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=3600
REFRESH_TOKEN_EXPIRATION=604800
BCRYPT_SALT_ROUNDS=10
```

### 4. Update User Data Model

If your application has custom user data stored in Supabase user metadata or profiles, you'll need to migrate this data to the new schema.

1. Identify all user-related data in your current application
2. Export user data from Supabase (if needed)
3. Import user data into the new PostgreSQL tables

Example migration SQL (customize as needed):

```sql
-- Example SQL to migrate user profiles from Supabase
INSERT INTO auth.users (id, email, password_hash, salt, is_admin)
SELECT 
    id, 
    email, 
    'PLACEHOLDER_HASH', -- Users will need to reset passwords
    'PLACEHOLDER_SALT', 
    role = 'admin' -- assuming you have a role field
FROM supabase_users;

-- Then migrate profile data
INSERT INTO profiles (id, full_name, avatar_url)
SELECT 
    id, 
    full_name, 
    avatar_url
FROM supabase_profiles;
```

### 5. Replace Supabase Client Imports

Search for and replace all Supabase client imports and authentication code:

1. Search for: `import { createClient } from '@supabase/supabase-js'`
2. Search for: `supabase.auth.` references
3. Replace with the new auth hooks and context

Example replacement:

```tsx
// Old Supabase code:
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const { data, error } = await supabase.auth.signInWithPassword({
  email: 'example@email.com',
  password: 'password',
});

// New custom auth code:
import { useAuthContext } from '@/hooks/auth';

const { login } = useAuthContext();

await login({
  email: 'example@email.com',
  password: 'password',
});
```

### 6. Update Auth UI Components

Replace Supabase Auth UI components with custom components using the new auth hooks:

1. Login form
2. Registration form
3. Password reset forms
4. Profile management with password change

### 7. Update Route Protection

Replace Supabase auth checks with the new `ProtectedRoute` component:

```tsx
// Old way with Supabase
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  // Redirect logic
}

// New way with custom auth
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const ProtectedPage = () => {
  return (
    <ProtectedRoute>
      {/* Protected content */}
    </ProtectedRoute>
  );
};
```

### 8. Update API Routes

Replace Supabase auth checks in API routes with the new auth middleware:

```typescript
// Old way with Supabase
const { data: { session } } = await supabase.auth.getSession();
if (!session) {
  return new Response(JSON.stringify({ error: 'Unauthorized' }), {
    status: 401,
  });
}

// New way with custom auth middleware
import { authMiddleware } from '@/lib/auth';

export async function GET(req: NextRequest) {
  // Check if authenticated
  const authResult = await authMiddleware.requireAuth(req);
  if (authResult) {
    return authResult; // Returns 401 response
  }
  
  // Authenticated code here
}
```

### 9. Test Authentication Flow

Test the complete authentication flow:

1. User registration
2. Login
3. Session validation
4. Logout
5. Password reset
6. Protected routes

### 10. Clean Up Supabase References

Remove all remaining Supabase references:

1. Remove Supabase environment variables
2. Remove Supabase packages (if not used for other features)
3. Remove Supabase initialization code

## Troubleshooting

### Common Issues

1. **JWT Errors**: Make sure your JWT_SECRET is set correctly in the .env.local file.

2. **Database Connection Issues**: Check your DATABASE_URL and ensure PostgreSQL is running.

3. **Authentication Not Persisting**: Check that cookies are being set correctly and not blocked by browser settings.

4. **Migration Data Issues**: If user data doesn't appear correctly after migration, check the database schema and data types.

### Getting Help

If you encounter issues during migration, check the logs in the browser console and server terminal for error messages.

## Rollback Plan

If you need to roll back to Supabase authentication:

1. Revert code changes using version control
2. Restore Supabase environment variables
3. Reinstall Supabase packages if removed

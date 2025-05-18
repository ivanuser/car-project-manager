# Admin Dev Mode Fix (JavaScript Version)

## Problem
The application was attempting to use a string ID ('admin-dev-mode') when querying the `user_preferences` table, but PostgreSQL expected a valid UUID. This caused errors with the error message: "invalid input syntax for type uuid: admin-dev-mode".

## The Updated Fix
We've created a plain JavaScript solution to address the issue with PostgreSQL UUID validation without requiring ts-node. The fix includes:

### 1. JavaScript Fix Script
A JavaScript script (`scripts/fix-admin-dev-mode.js`) that:
- Finds or creates the admin user
- Sets up proper preferences for the admin user with a valid UUID
- Removes any invalid preferences records with non-UUID IDs
- Works directly through the app's database connection

### 2. Updated Application Code
Modified the following files to handle 'admin-dev-mode' correctly:
- `actions/profile-actions.ts`: Special handling for admin-dev-mode in getUserPreferences and updateUserPreferences
- `app/api/user/preferences/route.ts`: API route now properly handles admin-dev-mode requests

## How to Apply the Fix

1. Run the JavaScript fix script:
   ```bash
   cd /home/ihoner/car-project-manager
   chmod +x scripts/fix-admin-mode.sh
   ./scripts/fix-admin-mode.sh
   ```

2. Restart your application server:
   ```bash
   npm run dev
   ```

## Technical Explanation

The issue was a type mismatch between the application code and database schema. The `user_preferences` table uses UUID as primary key (referencing auth.users), but the application was trying to use a string 'admin-dev-mode' as the ID.

The fix works by:
1. Detecting when 'admin-dev-mode' is used as an ID
2. Looking up the admin user's UUID from the database
3. Using that UUID instead of the string to query/update preferences
4. Creating the admin user and preferences if they don't exist

This allows the admin user to have persistent preferences while maintaining the UUID constraint in the database.

## Troubleshooting

If you encounter any issues:

1. Check the database connection in `.env.local` file
2. Ensure PostgreSQL is running
3. Look for any error messages in the script output
4. Check the application logs for additional details

For persistent issues, you may need to run the script with additional debugging:
```bash
NODE_DEBUG=db,pg node scripts/fix-admin-dev-mode.js
```

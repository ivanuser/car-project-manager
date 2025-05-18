# Admin Dev Mode Fix

## Problem
The application was attempting to use a string ID ('admin-dev-mode') when querying the `user_preferences` table, but PostgreSQL expected a valid UUID. This caused errors with the error message: "invalid input syntax for type uuid: admin-dev-mode".

## Fixed Files

1. **actions/profile-actions.ts**
   - Modified `getUserPreferences` function to handle 'admin-dev-mode' specially
   - When 'admin-dev-mode' is detected, looks up admin user by email (admin@cajpro.local)
   - Uses admin user's UUID instead of the string 'admin-dev-mode'
   - Added similar logic to `updateUserPreferences` function

2. **app/api/user/preferences/route.ts**
   - Added special handling for 'admin-dev-mode' in development environment

3. **Added New Files**
   - **scripts/fix-admin-dev-mode.ts**: TypeScript script to fix admin preferences
   - **scripts/fix-admin-mode.sh**: Shell script to run the TypeScript fix
   - **db/admin-dev-mode-fix.sql**: SQL script to ensure admin user has preferences

## How to Apply the Fix

1. Run the SQL fix script to ensure admin user has preferences:
   ```bash
   psql -U your_db_user -d your_db_name -f db/admin-dev-mode-fix.sql
   ```

2. Run the fix script to ensure admin preferences work correctly:
   ```bash
   chmod +x scripts/fix-admin-mode.sh
   ./scripts/fix-admin-mode.sh
   ```

3. Restart your application server.

## Technical Explanation

The issue was a type mismatch between the application code and database schema. The `user_preferences` table uses UUID as primary key (referencing auth.users), but the application was trying to use a string 'admin-dev-mode' as the ID.

The fix works by:
1. Detecting when 'admin-dev-mode' is used as an ID
2. Looking up the admin user's UUID from the database
3. Using that UUID instead of the string to query/update preferences

This allows the admin user to have persistent preferences while maintaining the UUID constraint in the database.

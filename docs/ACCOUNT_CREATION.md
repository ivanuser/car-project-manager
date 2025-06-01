# Creating Accounts in the PostgreSQL Authentication System

Now that we've moved from Supabase to a local PostgreSQL database, you'll need to create new accounts. Here are three ways to create accounts in the system:

## Option 1: Use the Admin Account

During database initialization, an admin account should have been automatically created:

- **Email**: `admin@cajpro.local`
- **Password**: `admin123`

You can use this account to log in to the system immediately.

## Option 2: Use the Registration Page

I've created a dedicated registration page that you can use to create new accounts:

1. Visit: http://localhost:3000/register (or your custom domain)
2. Fill in your email and password
3. Click "Create Account"

This page directly uses our PostgreSQL authentication system to create new accounts.

## Option 3: Run the Account Creation Script

If the above options don't work, you can create accounts directly in the database using the provided script:

```bash
# Make the script executable
chmod +x ./scripts/create-user.sh

# Run the script
./scripts/create-user.sh
```

This script will:
1. Prompt you for email, password, and admin status
2. Create the account directly in the PostgreSQL database
3. Create a corresponding profile entry

## Checking If Account Creation Worked

You can verify if your account was created by:

1. **Checking the Database**:
   ```sql
   SELECT * FROM auth.users;
   ```

2. **Trying to Log In**:
   - Visit your login page
   - Enter your credentials
   - You should be redirected to the dashboard upon successful login

## Notes About Existing Accounts

Your Supabase accounts are not automatically migrated to the new PostgreSQL database. If you need to migrate existing user data, you'll need to:

1. Export user data from Supabase
2. Import it into your PostgreSQL database with properly hashed passwords
3. Run the account creation script for each user (it's easier than writing a complex migration script)

## Troubleshooting

If you're having issues creating accounts:

1. **Check the database connection**:
   - Ensure PostgreSQL is running
   - Verify the connection parameters in your `.env.local` file

2. **Check for errors in the console**:
   - Open your browser's developer tools
   - Look for errors in the Console and Network tabs

3. **Use the direct login page**:
   - Visit http://localhost:3000/direct-login
   - This page has more detailed error reporting

4. **Check server logs**:
   - Run the app with `npm run dev` in a terminal
   - Look for errors in the server logs

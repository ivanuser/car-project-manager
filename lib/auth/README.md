# Caj-pro Custom Authentication System

This directory contains the custom authentication system for the Caj-pro car project build tracking application. This replaces the previous Supabase authentication with a PostgreSQL-based solution.

## Overview

The authentication system provides:

- User registration and login
- Session management with JWT tokens
- Password reset and change functionality
- Role-based access control (admin vs regular users)
- Client-side React hooks for authentication
- Server-side middleware for route protection

## Files Structure

- **db.ts** - PostgreSQL database connection and utility functions
- **password.ts** - Password hashing and validation utilities
- **jwt.ts** - JWT token generation and validation
- **auth-service.ts** - Main authentication service with core functionality
- **middleware.ts** - Authentication middleware for API routes
- **index.ts** - Module exports

## Database Schema

The authentication system uses the following tables in the `auth` schema:

- `users` - User accounts and credentials
- `sessions` - Active user sessions
- `password_reset_tokens` - Password reset tokens
- `email_confirmation_tokens` - Email confirmation tokens
- `refresh_tokens` - Refresh tokens for JWT renewal

## API Endpoints

The authentication system provides the following API endpoints:

- `/api/auth/register` - Register a new user
- `/api/auth/login` - Log in a user
- `/api/auth/logout` - Log out a user
- `/api/auth/session` - Get current session information
- `/api/auth/refresh` - Refresh an expired JWT token
- `/api/auth/reset-password` - Request and confirm password reset
- `/api/auth/change-password` - Change user password

## Client-Side Usage

1. Wrap your application with the `AuthProvider`:

```tsx
import { AuthProvider } from '@/hooks/auth';

const App = ({ children }) => {
  return <AuthProvider>{children}</AuthProvider>;
};
```

2. Use the auth hooks in your components:

```tsx
import { useAuthContext } from '@/hooks/auth';

const ProfileComponent = () => {
  const { user, authenticated, logout } = useAuthContext();

  if (!authenticated) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div>
      <h1>Profile for {user?.email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

3. Protect routes with the `ProtectedRoute` component:

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const DashboardPage = () => {
  return (
    <ProtectedRoute>
      <h1>Dashboard</h1>
      {/* Dashboard content */}
    </ProtectedRoute>
  );
};
```

## Configuration

The authentication system uses the following environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT token signing
- `JWT_EXPIRATION` - JWT token expiration time in seconds
- `REFRESH_TOKEN_EXPIRATION` - Refresh token expiration time in seconds
- `BCRYPT_SALT_ROUNDS` - Number of rounds for bcrypt password hashing

These variables should be set in the `.env.local` file.

## Security Considerations

- Passwords are hashed with bcrypt
- JWT tokens are short-lived (1 hour by default)
- Refresh tokens are rotated on use
- Sessions are validated on both client and server
- Auth cookies are HTTP-only and secure in production

/**
 * client-auth.ts - Client-side authentication utilities
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

// User interface
export interface User {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  emailConfirmedAt?: string;
  lastSignInAt?: string;
}

// Session interface
export interface Session {
  user: User | null;
  authenticated: boolean;
}

// Login data interface
export interface LoginData {
  email: string;
  password: string;
}

// Login result interface
export interface LoginResult {
  user: User;
  message: string;
}

// Registration data interface
export interface RegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
}

// Registration result interface
export interface RegistrationResult {
  user: User;
  message: string;
}

// Logout result interface
export interface LogoutResult {
  success: boolean;
  redirectUrl?: string;
  message?: string;
}

/**
 * Login user
 * @param email - User email
 * @param password - User password
 * @returns Login result
 */
export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResult> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Login failed');
  }

  return await response.json();
};

/**
 * Register user
 * @param email - User email
 * @param password - User password
 * @param confirmPassword - Password confirmation
 * @returns Registration result
 */
export const registerUser = async (
  email: string,
  password: string,
  confirmPassword: string
): Promise<RegistrationResult> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, confirmPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Registration failed');
  }

  return await response.json();
};

/**
 * Logout user
 * @returns Logout result
 */
export const logoutUser = async (): Promise<LogoutResult> => {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Logout failed');
  }

  // Parse the response JSON
  const result = await response.json();
  return result;
};

/**
 * Get current session
 * @returns Session information
 */
export const getSession = async (): Promise<Session> => {
  try {
    const response = await fetch('/api/auth/user', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return { user: null, authenticated: false };
    }

    const data = await response.json();
    return { user: data.user, authenticated: true };
  } catch (error) {
    console.error('Error getting session:', error);
    return { user: null, authenticated: false };
  }
};

/**
 * Request password reset
 * @param email - User email
 */
export const requestPasswordReset = async (email: string): Promise<void> => {
  const response = await fetch('/api/auth/password-reset/request', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Password reset request failed');
  }
};

/**
 * Reset password
 * @param token - Reset token
 * @param password - New password
 * @param confirmPassword - Password confirmation
 */
export const resetPassword = async (
  token: string,
  password: string,
  confirmPassword: string
): Promise<void> => {
  const response = await fetch('/api/auth/password-reset/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, password, confirmPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Password reset failed');
  }
};

/**
 * Change password
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @param confirmPassword - Password confirmation
 */
export const changePassword = async (
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<void> => {
  const response = await fetch('/api/auth/password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Password change failed');
  }
};

export default {
  loginUser,
  registerUser,
  logoutUser,
  getSession,
  requestPasswordReset,
  resetPassword,
  changePassword,
};

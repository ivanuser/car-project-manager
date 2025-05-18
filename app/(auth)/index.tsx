/**
 * DEPRECATED DIRECTORY
 * 
 * This directory and its contents are deprecated and should be removed.
 * All authentication functionality has been moved to dedicated routes:
 * - /login
 * - /register
 * - /forgot-password
 * - /reset-password
 * 
 * The files have been renamed with '.bak' extensions to prevent Next.js routing conflicts.
 */

console.warn("(auth) directory is deprecated and should be removed");

// Export an empty component to silence any import errors
export default function DeprecatedAuthComponent() {
  return null;
}

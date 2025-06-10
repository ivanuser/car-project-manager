/**
 * ProtectedRoute.tsx - Component to protect routes requiring authentication
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

'use client';

import React, { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '@/hooks/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  adminOnly?: boolean;
}

/**
 * Protected route component that redirects unauthenticated users
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  adminOnly = false 
}) => {
  const { user, authenticated, loading } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip during initial loading
    if (loading) return;

    // Redirect if not authenticated
    if (!authenticated) {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Redirect if admin access required but user is not admin
    if (adminOnly && user && !user.isAdmin) {
      router.push('/dashboard');
      return;
    }
  }, [authenticated, loading, router, pathname, adminOnly, user]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Show nothing while redirecting
  if (!authenticated || (adminOnly && user && !user.isAdmin)) {
    return null;
  }

  // Show children if authenticated and has required permissions
  return <>{children}</>;
};

export default ProtectedRoute;

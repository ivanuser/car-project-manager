'use client';

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { checkAuthStatus } from "@/lib/auth-utils"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { authenticated, user } = await checkAuthStatus();
        
        if (!authenticated || !user) {
          router.push('/login');
          return;
        }
        
        // For now, allow any authenticated user to access admin
        // In the future, you can add proper role checking here
        if (user.isAdmin || process.env.NODE_ENV === 'development') {
          setIsAuthorized(true);
        } else {
          router.push('/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error checking admin access:', error);
        router.push('/login');
        return;
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAccess();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">Redirecting...</p>
        </div>
      </div>
    );
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
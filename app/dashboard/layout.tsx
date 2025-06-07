'use client';

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { DashboardSidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { SidebarProvider } from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/toaster"
import { GradientBackground } from "@/components/gradient-background"
import { checkAuthStatus } from "@/lib/auth-utils"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('Dashboard Layout: Checking auth status...');
        const result = await checkAuthStatus();
        
        if (result.authenticated && result.user) {
          console.log('Dashboard Layout: User is authenticated as', result.user.email);
          
          // Try to fetch profile data
          try {
            const profileResponse = await fetch(`/api/user/profile?userId=${result.user.id}`);
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              setUserProfile({
                id: result.user.id,
                email: result.user.email,
                fullName: profileData.profile?.full_name,
                avatarUrl: profileData.profile?.avatar_url,
              });
            } else {
              // Fallback to basic user info
              setUserProfile({
                id: result.user.id,
                email: result.user.email,
              });
            }
          } catch (profileError) {
            console.error('Error fetching profile:', profileError);
            // Fallback to basic user info
            setUserProfile({
              id: result.user.id,
              email: result.user.email,
            });
          }
        } else {
          console.log('Dashboard Layout: User is not authenticated');
          setAuthError('Not authenticated');
          
          // Use window.location for a hard redirect to avoid middleware conflicts
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } catch (error) {
        console.error('Dashboard Layout: Error checking auth', error);
        setAuthError(error instanceof Error ? error.message : 'Authentication error');
        
        // Use window.location for a hard redirect to avoid middleware conflicts  
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userProfile || authError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Authentication Required</h1>
          <p className="text-muted-foreground mb-4">Redirecting to login page...</p>
          {authError && (
            <p className="text-sm text-red-600">Error: {authError}</p>
          )}
          <div className="mt-4">
            <div className="animate-pulse">
              <div className="h-2 bg-primary/20 rounded w-48 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
      {/* Gradient background with increased intensity */}
      <GradientBackground intensity="strong" />

      <div className="flex min-h-screen bg-background/80 backdrop-blur-[2px] relative">
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        <div className="flex w-full flex-col">
          <Header user={userProfile} />
          <main className="flex-1 p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}

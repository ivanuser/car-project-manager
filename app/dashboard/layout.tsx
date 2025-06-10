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
  const router = useRouter();

  const loadUserData = async () => {
    try {
      console.log('Dashboard Layout: Checking authentication...');
      const result = await checkAuthStatus();
      
      if (result.authenticated && result.user) {
        console.log('Dashboard Layout: User authenticated as', result.user.email);
        
        // Fetch complete profile data including avatar URL
        try {
          console.log('Dashboard Layout: Fetching profile data...');
          const profileResponse = await fetch(`/api/user/profile?userId=${result.user.id}`, {
            credentials: 'include'
          });
          
          let profileData = null;
          if (profileResponse.ok) {
            const profileResult = await profileResponse.json();
            profileData = profileResult.profile;
            console.log('Dashboard Layout: Profile data fetched:', profileData);
          } else {
            console.log('Dashboard Layout: Could not fetch profile data, using basic info');
          }
          
          // Set user profile with complete data
          setUserProfile({
            id: result.user.id,
            email: result.user.email,
            fullName: profileData?.full_name || result.user.fullName || result.user.email,
            avatarUrl: profileData?.avatar_url || null,
            isAdmin: result.user.isAdmin || false,
          });
          
          console.log('Dashboard Layout: User profile set:', {
            id: result.user.id,
            email: result.user.email,
            fullName: profileData?.full_name || result.user.fullName || result.user.email,
            avatarUrl: profileData?.avatar_url || null,
          });
          
        } catch (profileError) {
          console.error('Dashboard Layout: Error fetching profile data:', profileError);
          // Fallback to basic user info
          setUserProfile({
            id: result.user.id,
            email: result.user.email,
            fullName: result.user.fullName || result.user.email,
            avatarUrl: null,
            isAdmin: result.user.isAdmin || false,
          });
        }
      } else {
        console.log('Dashboard Layout: User not authenticated, redirecting...');
        router.push('/login');
        return;
      }
    } catch (error) {
      console.error('Dashboard Layout: Authentication error', error);
      router.push('/login');
      return;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [router]);

  // Listen for profile updates from other components
  useEffect(() => {
    const handleProfileUpdate = () => {
      console.log('Dashboard Layout: Profile update event received, refreshing user data...');
      loadUserData();
    };

    // Listen for custom event when profile is updated
    window.addEventListener('profile-updated', handleProfileUpdate);
    
    return () => {
      window.removeEventListener('profile-updated', handleProfileUpdate);
    };
  }, []);

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

  if (!userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Redirecting to Login</h1>
          <p className="text-muted-foreground">Please wait...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={true}>
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

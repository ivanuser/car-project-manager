'use client';

import BasicDashboard from '../dashboard/basic-page';
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { Header } from "@/components/dashboard/header";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { GradientBackground } from "@/components/gradient-background";
import { useEffect, useState } from 'react';
import { checkAuthStatus } from "@/lib/auth-utils";

// Dashboard view page using PostgreSQL authentication
export default function DashboardViewPage() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        console.log('Dashboard-View: Checking auth status...');
        const result = await checkAuthStatus();
        
        if (result.authenticated && result.user) {
          console.log('Dashboard-View: User is authenticated as', result.user.email);
          
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
          console.log('Dashboard-View: User is not authenticated');
          setUserProfile(null);
        }
      } catch (error) {
        console.error('Dashboard-View: Error checking auth', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
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
            <BasicDashboard />
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  );
}
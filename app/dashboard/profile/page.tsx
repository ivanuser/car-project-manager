'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { checkAuthStatus } from "@/lib/auth-utils";

export default function ProfilePage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { authenticated, user: authUser } = await checkAuthStatus();
        
        if (authenticated && authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email
          });
          
          // Only fetch profile if we have user authentication
          try {
            console.log("Fetching profile for user ID:", authUser.id);
            const profileResponse = await fetch(`/api/user/profile?userId=${authUser.id}`);
            if (profileResponse.ok) {
              const profileData = await profileResponse.json();
              console.log("Received profile data:", profileData);
              if (profileData.profile) {
                setProfile(profileData.profile);
              }
            } else {
              console.warn('Failed to load profile data');
              setError('Failed to load profile data');
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Error loading profile');
          }
        } else {
          setError('You must be logged in to view this page');
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setError('Error checking authentication');
      } finally {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-destructive">{error || 'You must be logged in to view this page.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Manage your account information and preferences.</p>
      </div>

      <div className="space-y-6">
        {/* Basic Profile Info */}
        <div className="grid gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Account Information</h3>
              <div className="mt-2 space-y-2">
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Email:</span>
                  <span className="ml-2">{user.email}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-muted-foreground">User ID:</span>
                  <span className="ml-2 font-mono text-xs">{user.id}</span>
                </div>
                {profile?.full_name && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Full Name:</span>
                    <span className="ml-2">{profile.full_name}</span>
                  </div>
                )}
                {profile?.bio && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Bio:</span>
                    <span className="ml-2">{profile.bio}</span>
                  </div>
                )}
                {profile?.location && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Location:</span>
                    <span className="ml-2">{profile.location}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground">
          <p>Profile editing functionality will be added in a future update.</p>
        </div>
      </div>
    </div>
  );
}
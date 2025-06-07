'use client';

import { useEffect, useState } from 'react';
import { checkAuthStatus } from "@/lib/auth-utils";
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { ProfileForm } from "@/components/profile/profile-form"
import { PasswordForm } from "@/components/profile/password-form"

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
          
          // Fetch user profile data
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
              const errorData = await profileResponse.json();
              console.error('Profile error details:', errorData);
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

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <div>
          <AvatarUpload currentAvatarUrl={profile?.avatar_url} userId={user.id} />
        </div>
        <div className="space-y-6">
          <ProfileForm profile={profile || {}} />
          <PasswordForm email={user.email} />
        </div>
      </div>
    </div>
  );
}
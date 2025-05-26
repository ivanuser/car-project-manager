'use client';

import { useEffect, useState } from 'react';
import { checkAuthStatus } from "@/lib/auth-utils";
import { PreferencesForm } from "@/components/profile/preferences-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Settings, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DatabaseDebug } from "@/components/debug/db-debug";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";
import Link from "next/link";
import Image from "next/image";

// Define default preferences structure to ensure it matches what the PreferencesForm expects
const defaultPreferences = {
  theme: 'system',
  color_scheme: 'default',
  background_intensity: 'medium',
  ui_density: 'comfortable',
  date_format: 'MM/DD/YYYY',
  time_format: '12h',
  measurement_unit: 'imperial',
  currency: 'USD',
  notification_preferences: {
    email: true,
    push: true,
    maintenance: true,
    project_updates: true,
  },
  display_preferences: {
    default_project_view: 'grid',
    default_task_view: 'list',
    show_completed_tasks: true,
  }
};

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<any>(defaultPreferences);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { authenticated, user: authUser } = await checkAuthStatus();
        
        if (authenticated && authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email
          });
          
          // Fetch user preferences from the database
          try {
            console.log("Fetching preferences for user ID:", authUser.id);
            const response = await fetch(`/api/user/preferences?userId=${authUser.id}`);
            if (response.ok) {
              const data = await response.json();
              console.log("Received preferences data:", data);
              if (data.preferences) {
                // Make sure all required preference objects exist
                const mergedPrefs = {
                  ...defaultPreferences,
                  ...data.preferences,
                  notification_preferences: {
                    ...defaultPreferences.notification_preferences,
                    ...(data.preferences.notification_preferences || {})
                  },
                  display_preferences: {
                    ...defaultPreferences.display_preferences,
                    ...(data.preferences.display_preferences || {})
                  }
                };
                console.log("Merged preferences:", mergedPrefs);
                setPreferences(mergedPrefs);
              }
            } else {
              console.warn('Failed to load preferences, using defaults');
              const errorData = await response.json();
              console.error('Error details:', errorData);
            }
          } catch (error) {
            console.error('Error fetching preferences:', error);
          }
          
          // Fetch user profile data (including avatar)
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
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
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
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">You must be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your application settings and preferences.</p>
      </div>

      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium">Account Information</h3>
          <p className="text-muted-foreground">Your account details and profile</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-[200px_1fr]">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-border bg-muted">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Profile avatar"
                    width={96}
                    height={96}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // If image fails to load, hide it and show initials
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-muted text-2xl font-bold text-muted-foreground">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="text-center">
              <h4 className="font-medium">
                {profile?.full_name || 'No name set'}
              </h4>
              <p className="text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
            
            <Link href="/dashboard/profile">
              <Button variant="outline" size="sm" className="w-full">
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>
          
          {/* Account Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
              <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {profile?.full_name || 'Not set'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
              <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {user.email}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Bio</label>
              <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded min-h-[60px]">
                {profile?.bio || 'No bio provided'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                {profile?.location || 'Not specified'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
              <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs">
                {user.id}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <PreferencesForm preferences={preferences} />
      
      {/* Add database debug component */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">Development Tools</h2>
          <DatabaseDebug />
        </div>
      )}
    </div>
  );
}

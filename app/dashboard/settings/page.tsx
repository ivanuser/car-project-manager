'use client';

import { useEffect, useState } from 'react';
import { checkAuthStatus } from "@/lib/auth-utils";
import { PreferencesForm } from "@/components/profile/preferences-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<any>({
    theme: 'system',
    emailNotifications: true,
    taskReminders: true
  });

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { authenticated, user: authUser } = await checkAuthStatus();
        
        if (authenticated && authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email
          });
          
          // For now, use default preferences
          // In the future, we would load these from the database
          setPreferences({
            theme: 'system',
            emailNotifications: true,
            taskReminders: true
          });
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

      <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertTitle>Database Migration in Progress</AlertTitle>
        <AlertDescription>
          We're currently migrating from Supabase to PostgreSQL. Some settings functionality may be limited.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-lg font-medium">User Information</h3>
          <p className="text-muted-foreground">Your account details</p>
        </div>
        
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
            <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded">
              {user.email}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">User ID</label>
            <div className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded font-mono text-xs">
              {user.id}
            </div>
          </div>
        </div>
      </Card>

      <PreferencesForm preferences={preferences} />
    </div>
  );
}

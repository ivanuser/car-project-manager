'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { checkAuthStatus } from "@/lib/auth-utils";

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const { authenticated: isAuth } = await checkAuthStatus();
        setAuthenticated(isAuth);
        
        if (isAuth) {
          // In a future update, we'll load actual tasks data here
          setTasks([]);
        }
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Task Reports</h2>
          <p className="text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Task Reports</h2>
          <p className="text-destructive">You must be logged in to view reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Task Reports</h2>
        <p className="text-muted-foreground">View task completion rates and time tracking reports</p>
      </div>

      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">Reports Coming Soon</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Task reports and analytics will be available in a future update.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Create some projects and tasks first, then return here for insights.
        </p>
      </div>
    </div>
  );
}
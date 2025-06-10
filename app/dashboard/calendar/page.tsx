'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';

export default function CalendarPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple loading state without auth checks that might cause SSR issues
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Work Calendar</h2>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Work Calendar</h2>
        <p className="text-muted-foreground">Schedule and manage your work sessions across all projects</p>
      </div>

      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">Calendar Coming Soon</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Work session calendar will be available in a future update.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Create some projects first, then return here to schedule work sessions.
        </p>
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import BasicDashboard from './basic-page';
import { enableDevAdminMode } from '@/lib/auth-utils';

// Enable dev admin mode automatically in development
export default function DashboardPage() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Automatically enable admin mode in development
      enableDevAdminMode();
    }
  }, []);

  return <BasicDashboard />;
}

'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';

export default function UploadDocumentPage() {
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
          <h2 className="text-2xl font-bold tracking-tight">Upload Document</h2>
          <p className="text-muted-foreground">Loading upload form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Upload Document</h2>
        <p className="text-muted-foreground">Add a new document to your repository</p>
      </div>

      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-muted-foreground">Document Upload Coming Soon</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Document upload functionality will be available in a future update.
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Focus on creating projects and managing tasks for now.
        </p>
      </div>
    </div>
  )
}

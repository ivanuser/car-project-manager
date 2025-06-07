'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DocumentsPage() {
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
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">Manage and organize your project documentation</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/documents/upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground">No Documents Yet</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Document management will be available in a future update.
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Upload your first document to get started.
            </p>
          </div>
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-muted-foreground">Categories Coming Soon</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Document categories will be available in a future update.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

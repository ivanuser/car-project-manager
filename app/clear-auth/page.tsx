'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClearAuthPage() {
  const [storageItems, setStorageItems] = useState<string[]>([]);

  useEffect(() => {
    // Check what auth-related items are in storage
    const items = [];
    if (typeof window !== 'undefined') {
      const localStorage = window.localStorage;
      const sessionStorage = window.sessionStorage;
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('cajpro') || key.includes('auth'))) {
          items.push(`localStorage: ${key} = ${localStorage.getItem(key)}`);
        }
      }
      
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('cajpro') || key.includes('auth'))) {
          items.push(`sessionStorage: ${key} = ${sessionStorage.getItem(key)}`);
        }
      }
      
      // Check cookies
      const cookies = document.cookie.split(';').map(c => c.trim());
      cookies.forEach(cookie => {
        if (cookie.includes('cajpro') || cookie.includes('auth')) {
          items.push(`cookie: ${cookie}`);
        }
      });
    }
    setStorageItems(items);
  }, []);

  const clearAllAuth = () => {
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.removeItem('cajpro_auth_user');
      localStorage.removeItem('cajpro_dev_mode');
      
      // Clear sessionStorage
      sessionStorage.removeItem('cajpro_auth_session');
      
      // Clear auth cookies (set to expire)
      document.cookie = 'cajpro_auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      
      alert('All authentication data cleared! Please refresh the page and log in again.');
      
      // Refresh the page
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Clear Authentication Data</h1>
        <p className="text-muted-foreground">Clear all stored authentication data and start fresh</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Auth Storage</CardTitle>
          <CardDescription>Items currently stored related to authentication</CardDescription>
        </CardHeader>
        <CardContent>
          {storageItems.length > 0 ? (
            <div className="space-y-2">
              {storageItems.map((item, index) => (
                <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
                  {item}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No authentication data found in storage</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Clear Authentication</CardTitle>
          <CardDescription>Clear all authentication data from browser storage</CardDescription>
        </CardHeader>
          <CardContent>
          <Button onClick={clearAllAuth} variant="destructive">
            Clear All Auth Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
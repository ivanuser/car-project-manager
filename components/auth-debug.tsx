"use client"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { enableDevAdminMode } from '@/lib/auth-utils';

export function AuthDebugTools() {
  const [debugOutput, setDebugOutput] = useState('');
  
  const checkCookies = () => {
    const cookies = document.cookie.split(';').map(c => c.trim());
    setDebugOutput(`Found ${cookies.length} cookies:\n${cookies.join('\n')}`);
  };
  
  const checkLocalStorage = () => {
    const authItems = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('auth') || key.includes('user') || key.includes('session'))) {
        authItems.push(`${key}: ${localStorage.getItem(key)}`);
      }
    }
    
    setDebugOutput(`Found ${authItems.length} auth-related items in localStorage:\n${authItems.join('\n')}`);
  };
  
  const enableAdminMode = () => {
    const result = enableDevAdminMode();
    if (result) {
      setDebugOutput('Development admin mode enabled. You can now access authenticated areas of the app.');
    } else {
      setDebugOutput('Failed to enable development admin mode. This feature is only available in development.');
    }
  };
  
  const clearStorage = () => {
    localStorage.clear();
    sessionStorage.clear();
    setDebugOutput('All localStorage and sessionStorage items cleared');
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Authentication Debug Tools</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={checkCookies} variant="outline">Check Cookies</Button>
            <Button onClick={checkLocalStorage} variant="outline">Check LocalStorage</Button>
            <Button onClick={enableAdminMode} variant="outline">Enable Dev Admin Mode</Button>
            <Button onClick={clearStorage} variant="outline">Clear Storage</Button>
          </div>
          
          {debugOutput && (
            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-md">
              <pre className="whitespace-pre-wrap text-xs font-mono">
                {debugOutput}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        These tools are for development and debugging purposes only.
      </CardFooter>
    </Card>
  );
}

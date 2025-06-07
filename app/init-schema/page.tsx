'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, Database } from 'lucide-react';

export default function InitSchemaPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const initializeSchema = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/init-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        alert('✅ Database schema initialized successfully! You can now register and login.');
      }
    } catch (error) {
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error) 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Database className="h-6 w-6" />
          Initialize Database Schema
        </h1>
        <p className="text-muted-foreground">Create the required tables for user authentication</p>
      </div>

      <Alert>
        <Database className="h-4 w-4" />
        <AlertTitle>Database Schema Setup</AlertTitle>
        <AlertDescription>
          This will create the necessary tables for user authentication:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>users</strong> - Main user accounts table</li>
            <li><strong>user_profiles</strong> - User profile information</li>
            <li><strong>user_preferences</strong> - User settings and preferences</li>
          </ul>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Initialize Schema</CardTitle>
          <CardDescription>Click the button below to create the database tables</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={initializeSchema} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Initializing Database...' : 'Initialize Database Schema'}
          </Button>
          
          {result && (
            <div className="space-y-2">
              {result.success ? (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>Success!</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-1 text-sm">
                      <p>✅ Database schema initialized successfully</p>
                      <p>✅ Tables created: {result.tables?.join(', ')}</p>
                      <p className="font-medium mt-2">You can now:</p>
                      <ul className="list-disc list-inside ml-4">
                        <li>Register new accounts</li>
                        <li>Login with existing accounts</li>
                        <li>Access profile and settings pages</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-500 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-1 text-sm">
                      <p>✗ Failed to initialize schema</p>
                      <p>Error: {result.error}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          After successful initialization, go to{' '}
          <a href="/login" className="text-primary hover:underline">
            /login
          </a>{' '}
          to register your account
        </p>
      </div>
    </div>
  );
}
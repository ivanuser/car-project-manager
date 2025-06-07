'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

export default function CheckUsersPage() {
  const [email, setEmail] = useState('ihoner@rand.org');
  const [result, setResult] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [dbTest, setDbTest] = useState<any>(null);
  const [cookieInfo, setCookieInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Check cookies on page load
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';').map(c => c.trim());
      const authCookies = cookies.filter(c => c.includes('cajpro') || c.includes('auth'));
      setCookieInfo({
        hasCookies: authCookies.length > 0,
        cookies: authCookies,
        allCookies: cookies
      });
    }
  }, []);

  const testDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/db-test');
      const data = await response.json();
      setDbTest(data);
    } catch (error) {
      setDbTest({ 
        success: false, 
        error: { message: 'Failed to connect to database test API' } 
      });
    } finally {
      setLoading(false);
    }
  };

  const checkSpecificUser = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/debug/users?email=${encodeURIComponent(email)}`);
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to check user' });
    } finally {
      setLoading(false);
    }
  };

  const listAllUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/debug/users');
      const data = await response.json();
      setAllUsers(data.users || []);
      setResult(data.error ? { error: data.error, details: data.details } : null);
    } catch (error) {
      setAllUsers([]);
      setResult({ error: 'Failed to fetch users' });
    } finally {
      setLoading(false);
    }
  };

  const testAuth = async () => {
    try {
      const response = await fetch('/api/auth/check');
      const data = await response.json();
      alert(`Auth test result: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      alert(`Auth test failed: ${error}`);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Authentication & Database Diagnostics</h1>
        <p className="text-muted-foreground">Comprehensive testing for authentication and database issues</p>
      </div>

      {/* Cookie Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {cookieInfo?.hasCookies ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            Cookie Status
          </CardTitle>
          <CardDescription>Authentication cookies in browser</CardDescription>
        </CardHeader>
        <CardContent>
          {cookieInfo?.hasCookies ? (
            <div className="space-y-2">
              <p className="text-green-600 font-medium">✓ Authentication cookies found</p>
              {cookieInfo.cookies.map((cookie, index) => (
                <div key={index} className="text-sm font-mono bg-muted p-2 rounded">
                  {cookie}
                </div>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-red-600 font-medium">✗ No authentication cookies found</p>
              <p className="text-sm text-muted-foreground mt-2">
                This means you're not properly logged in. The login might be failing to set cookies.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Database Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Database Connection Test
          </CardTitle>
          <CardDescription>Test basic database connectivity and schema</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testDatabase} disabled={loading}>
            {loading ? 'Testing...' : 'Test Database'}
          </Button>
          
          {dbTest && (
            <div className="space-y-2">
              {dbTest.success ? (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle>Database Connected</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-1 text-sm">
                      <p>✓ PostgreSQL connection successful</p>
                      <p>✓ Users table exists: {dbTest.database.usersTableExists ? 'Yes' : 'No'}</p>
                      <p>✓ User count: {dbTest.database.userCount}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-red-500 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <AlertTitle>Database Error</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-1 text-sm">
                      <p>✗ Error: {dbTest.error.message}</p>
                      <p>Code: {dbTest.error.code || 'N/A'}</p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <pre className="text-sm overflow-x-auto">
                  {JSON.stringify(dbTest, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Check */}
      <Card>
        <CardHeader>
          <CardTitle>Check Specific User</CardTitle>
          <CardDescription>Enter an email to check if a user exists</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={checkSpecificUser} disabled={loading}>
              {loading ? 'Checking...' : 'Check User'}
            </Button>
          </div>
          
          {result && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <pre className="text-sm overflow-x-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Users */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>List all users in the database (last 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={listAllUsers} disabled={loading} className="mb-4">
            {loading ? 'Loading...' : 'List All Users'}
          </Button>
          
          {allUsers.length > 0 && (
            <div className="space-y-2">
              {allUsers.map((user, index) => (
                <div key={index} className="p-3 bg-muted rounded">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-sm text-muted-foreground">
                    ID: {user.id} | Created: {new Date(user.created_at).toLocaleString()}
                    {user.last_login && ` | Last Login: ${new Date(user.last_login).toLocaleString()}`}
                    | Active: {user.is_active ? 'Yes' : 'No'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auth Test */}
      <Card>
        <CardHeader>
          <CardTitle>Auth Check Test</CardTitle>
          <CardDescription>Test the authentication check API</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={testAuth}>Test Auth Check</Button>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Troubleshooting Steps</AlertTitle>
        <AlertDescription>
          <ol className="list-decimal list-inside space-y-1 text-sm mt-2">
            <li>First, test the database connection above</li>
            <li>If database fails, check your PostgreSQL server is running</li>
            <li>If database works but no cookies, the login is failing to set cookies (likely HTTPS/secure cookie issue)</li>
            <li>If cookies exist but profile/settings fail, there's an auth check problem</li>
            <li>Use /clear-auth to clear all auth data and start fresh</li>
          </ol>
        </AlertDescription>
      </Alert>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CheckUsersPage() {
  const [email, setEmail] = useState('ihoner@rand.org');
  const [result, setResult] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

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
    } catch (error) {
      setAllUsers([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Database Check</h1>
        <p className="text-muted-foreground">Check what users exist in the database</p>
      </div>

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
    </div>
  );
}
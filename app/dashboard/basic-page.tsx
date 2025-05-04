"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle, ShieldCheck } from "lucide-react";
import { AuthStatusIndicator } from "@/components/auth-status-indicator";
import { checkAuthStatus } from "@/lib/auth-utils";

export default function BasicDashboard() {
  // Start with loading state
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [userInfo, setUserInfo] = useState<{email?: string; id?: string} | null>(null);

  // Check auth status when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log('Dashboard: Checking auth status...');
        const result = await checkAuthStatus();
        
        if (result.authenticated && result.user) {
          console.log('Dashboard: User is authenticated as', result.user.email);
          setAuthStatus('authenticated');
          setUserInfo({
            email: result.user.email,
            id: result.user.id
          });
        } else {
          console.log('Dashboard: User is not authenticated');
          setAuthStatus('unauthenticated');
          setUserInfo(null);
        }
      } catch (error) {
        console.error('Dashboard: Error checking auth', error);
        setAuthStatus('unauthenticated');
      }
    };
    
    fetchUserData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome{userInfo?.email ? ` ${userInfo.email}` : ''} to CAJPRO, your vehicle project management platform.
          </p>
        </div>
      </div>

      {authStatus === 'authenticated' ? (
        <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
          <ShieldCheck className="h-4 w-4 text-green-600" />
          <AlertTitle>Authentication Successful</AlertTitle>
          <AlertDescription>
            You're now logged in and can access all features of the application.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-yellow-50 dark:bg-yellow-900/20">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertTitle>Authentication Notice</AlertTitle>
          <AlertDescription>
            You're seeing this simplified dashboard because we're working on authentication issues.
            This is a temporary measure while we fix session handling.
          </AlertDescription>
        </Alert>
      )}

      {/* Auth Status Indicator */}
      <AuthStatusIndicator />

      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Create Your First Project</h3>
          <Button variant="outline" asChild size="sm">
            <Link href="/dashboard/projects">View All Projects</Link>
          </Button>
        </div>

        <Card className="shadow-lg border-2 border-primary/20 hover:border-primary/40 transition-all duration-300">
          <CardContent className="py-12 text-center flex flex-col items-center">
            <div className="mb-6 w-32 h-32 flex items-center justify-center">
              <svg
                width="100"
                height="100"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="text-primary/70"
              >
                <path
                  d="M22.5 8.5L20.5 2.5C20.3 2 19.8 1.5 19.2 1.5H4.8C4.2 1.5 3.7 1.9 3.5 2.5L1.5 8.5C1.2 9.2 1 9.9 1 10.7V19.5C1 20.1 1.4 20.5 2 20.5H3C3.6 20.5 4 20.1 4 19.5V18.5H20V19.5C20 20.1 20.4 20.5 21 20.5H22C22.6 20.5 23 20.1 23 19.5V10.7C23 9.9 22.8 9.2 22.5 8.5Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 11.5H20"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6.5 14.5C7.32843 14.5 8 13.8284 8 13C8 12.1716 7.32843 11.5 6.5 11.5C5.67157 11.5 5 12.1716 5 13C5 13.8284 5.67157 14.5 6.5 14.5Z"
                  fill="currentColor"
                />
                <path
                  d="M17.5 14.5C18.3284 14.5 19 13.8284 19 13C19 12.1716 18.3284 11.5 17.5 11.5C16.6716 11.5 16 12.1716 16 13C16 13.8284 16.6716 14.5 17.5 14.5Z"
                  fill="currentColor"
                />
                <path
                  d="M4.8 7.5L6.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M19.2 7.5L17.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 15.5H3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20.5 15.5H22"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="text-muted-foreground mb-6 text-lg">
              Start tracking your vehicle build project
            </p>
            <Button asChild size="lg">
              <Link href="/dashboard/projects/new">Create New Project</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/50">
          <CardHeader>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>Manage your project tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Task Management</span>
                <Link href="/dashboard/tasks" className="text-xs text-primary hover:underline">
                  View All
                </Link>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Task Reports</span>
                <Link href="/dashboard/reports" className="text-xs text-primary hover:underline">
                  View Reports
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full hover:bg-primary/10">
              <Link href="/dashboard/tasks/new">Create New Task</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-secondary/50">
          <CardHeader>
            <CardTitle>Parts</CardTitle>
            <CardDescription>Track parts for your projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <p className="text-muted-foreground">Parts inventory coming soon</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full hover:bg-secondary/10" disabled>
              View Parts
            </Button>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-accent/50">
          <CardHeader>
            <CardTitle>Authentication Debug</CardTitle>
            <CardDescription>Debug auth issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-2">
              <p className="text-muted-foreground">Check authentication status</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full hover:bg-accent/10">
              <Link href="/api/auth/debug" target="_blank">Check Auth Status</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

/**
 * Login page component
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthContext } from '@/hooks/auth';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function LoginPage() {
  const { login, loading, error } = useAuthContext();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Get callbackUrl from query params
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
  
  // Check for success messages
  const passwordChanged = searchParams.get('passwordChanged') === 'true';
  const passwordReset = searchParams.get('reset') === 'success';
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      console.error('Login error:', err);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mt-6 text-gray-900 dark:text-white">Welcome to Caj-pro</h1>
          <h2 className="mt-2 text-md text-gray-600 dark:text-gray-300">
            Sign in to your account
          </h2>
        </div>
        
        <Card className="w-full shadow-lg border-t-4 border-indigo-500 dark:border-indigo-400">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          
          {/* Success messages */}
          {passwordChanged && (
            <Alert className="mx-6 mb-4 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
              <AlertDescription>
                Your password has been changed successfully. Please log in with your new password.
              </AlertDescription>
            </Alert>
          )}
          
          {passwordReset && (
            <Alert className="mx-6 mb-4 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800">
              <AlertDescription>
                Your password has been reset successfully. Please log in with your new password.
              </AlertDescription>
            </Alert>
          )}
          
          {/* Error message */}
          {error && (
            <Alert className="mx-6 mb-4 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800">
              <AlertDescription className="text-red-800 dark:text-red-300">
                {error}
              </AlertDescription>
            </Alert>
          )}
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-gray-300">
                  Remember me
                </label>
              </div>
              
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Don't have an account?{' '}
              <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
                Register
              </Link>
            </p>
          </CardFooter>
        </Card>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-4 text-xs text-center text-gray-500 dark:text-gray-400">
            <p>Development credentials:</p>
            <p className="font-mono">Email: admin@cajpro.local</p>
            <p className="font-mono">Password: admin123</p>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Forgot password page component
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/hooks/auth';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ForgotPasswordPage() {
  const { resetPassword, loading, error } = useAuthContext();
  
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(email);
    setSubmitted(true);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold mt-6 text-gray-900">Forgot Password</h1>
          <h2 className="mt-2 text-md text-gray-600">
            Reset your account password
          </h2>
        </div>
        
        {/* Success message */}
        {submitted && (
          <div className="bg-green-50 p-4 rounded-md text-green-800 mb-4">
            If an account exists with the email <strong>{email}</strong>, we've sent password reset instructions.
            Please check your email.
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
            {error}
          </div>
        )}
        
        {!submitted ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  'Send Reset Instructions'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-6">
            <button
              onClick={() => setSubmitted(false)}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try another email
            </button>
          </div>
        )}
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

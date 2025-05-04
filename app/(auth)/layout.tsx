/**
 * Auth layout component
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { AuthProvider } from '@/hooks/auth';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <header className="bg-white shadow-sm py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {/* App logo - replace with your actual logo */}
                <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  CP
                </div>
              </div>
              <h1 className="ml-3 text-xl font-bold text-gray-900">Caj-pro</h1>
            </div>
            <div className="text-sm text-gray-600">
              Car Project Manager
            </div>
          </div>
        </header>
        
        <main className="flex-grow flex">
          {children}
        </main>
        
        <footer className="bg-white py-4 border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} Caj-pro. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}

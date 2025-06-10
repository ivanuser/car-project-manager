'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface FixResult {
  success: boolean;
  message: string;
  details?: any;
  nextSteps?: string[];
  error?: string;
}

export default function FixAuthSystemPage() {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<FixResult | null>(null);

  const handleFixAuth = async () => {
    setIsFixing(true);
    setResult(null);

    try {
      console.log('🔧 Starting authentication system fix...');
      
      const response = await fetch('/api/fix-auth-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('✅ Authentication system fix completed:', data);
        setResult(data);
      } else {
        console.error('❌ Authentication system fix failed:', data);
        setResult({
          success: false,
          message: 'Failed to fix authentication system',
          error: data.error || 'Unknown error occurred'
        });
      }
    } catch (error) {
      console.error('❌ Error fixing authentication system:', error);
      setResult({
        success: false,
        message: 'Network error occurred',
        error: error instanceof Error ? error.message : String(error)
      });
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            🔧 Authentication System Fix
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Comprehensive fix for all authentication issues in CAJ-Pro
          </p>
        </div>

        {/* Main Card */}
        <Card className="border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <Info className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-white">Authentication Issues Identified</h2>
                <p className="text-slate-400">The following problems will be resolved:</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Issues List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white">🔍 Issues Found:</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>Sessions table missing or misconfigured</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>Duplicate session token constraint errors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>Schema mismatch between code and database</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>Missing admin user for testing</span>
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h3 className="text-lg font-medium text-white">✨ Fixes Applied:</h3>
                <ul className="space-y-2 text-slate-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Create proper sessions table with indexes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Implement unique session token generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Update database schema to match code</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Create admin@cajpro.local / admin123</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Clean up expired sessions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>Add proper error handling and logging</span>
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="bg-slate-600" />

            {/* Action Button */}
            <div className="text-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold px-8 py-3"
                onClick={handleFixAuth}
                disabled={isFixing}
              >
                {isFixing ? '🔧 Fixing Authentication System...' : '🚀 Fix Authentication System'}
              </Button>
            </div>

            {/* Results */}
            {result && (
              <div className="mt-6">
                <Separator className="bg-slate-600 mb-6" />
                
                <Card className={`border ${result.success 
                  ? 'border-green-500/50 bg-green-500/10' 
                  : 'border-red-500/50 bg-red-500/10'
                }`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      {result.success ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      ) : (
                        <AlertCircle className="w-8 h-8 text-red-400" />
                      )}
                      <div>
                        <h3 className={`text-xl font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                          {result.success ? '✅ Fix Completed Successfully!' : '❌ Fix Failed'}
                        </h3>
                        <p className="text-slate-300">{result.message}</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {result.success && result.details && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium text-white">📊 Database Status:</h4>
                          <ul className="space-y-1 text-sm text-slate-300">
                            <li>Users: {result.details.userCount}</li>
                            <li>Sessions: {result.details.sessionCount}</li>
                            <li>Profiles: {result.details.profileCount}</li>
                            <li>Expired sessions cleaned: {result.details.expiredSessionsCleaned}</li>
                          </ul>
                        </div>
                        
                        <div className="space-y-2">
                          <h4 className="font-medium text-white">🎯 Next Steps:</h4>
                          <ul className="space-y-1 text-sm text-slate-300">
                            {result.nextSteps?.map((step, index) => (
                              <li key={index}>• {step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                    
                    {result.error && (
                      <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                        <h4 className="font-medium text-red-400 mb-2">Error Details:</h4>
                        <p className="text-sm text-red-300 font-mono">{result.error}</p>
                      </div>
                    )}
                    
                    {result.success && (
                      <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                        <h4 className="font-medium text-green-400 mb-2">🎉 Ready for Testing!</h4>
                        <p className="text-sm text-green-300">
                          Authentication system is now fixed and ready for production use. 
                          You can test with admin@cajpro.local / admin123 or create new user accounts.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-slate-400 text-sm">
          <p>CAJ-Pro Authentication System Fix • {new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
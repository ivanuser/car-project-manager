'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Database } from 'lucide-react';

export default function FixDatabasePage() {
  const [isFixing, setIsFixing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleFix = async () => {
    setIsFixing(true);
    setResult(null);

    try {
      const response = await fetch('/api/fix-updated-at', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Database className="h-12 w-12 text-blue-400" />
            </div>
            <CardTitle className="text-2xl text-white">Database Schema Fix</CardTitle>
            <p className="text-slate-300">
              Fix the missing updated_at column causing login errors
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert className="bg-yellow-500/10 border-yellow-500/20">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <AlertDescription className="text-yellow-200">
                <strong>Issue:</strong> PostgreSQL trigger trying to update updated_at column that doesn't exist.
                This is causing login failures.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">What this fix does:</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Adds missing updated_at columns to all tables
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Updates trigger functions to be more robust
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Fixes authentication login errors
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  Preserves all existing data
                </li>
              </ul>
            </div>

            <Button 
              onClick={handleFix}
              disabled={isFixing}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isFixing ? '🔧 Fixing Database...' : '🚀 Fix Database Schema'}
            </Button>

            {result && (
              <div className="mt-6">
                <Alert className={`${result.success 
                  ? 'bg-green-500/10 border-green-500/20' 
                  : 'bg-red-500/10 border-red-500/20'
                }`}>
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <AlertDescription className={result.success ? 'text-green-200' : 'text-red-200'}>
                    <strong>{result.success ? '✅ Success!' : '❌ Error:'}</strong> {result.message}
                  </AlertDescription>
                </Alert>

                {result.success && result.details && (
                  <div className="mt-4 p-4 bg-white/5 rounded-lg">
                    <h4 className="font-semibold text-white mb-2">Fix Results:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-400">Statements executed:</span>
                        <span className="text-white ml-2">{result.details.statementsExecuted}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Successful:</span>
                        <span className="text-green-400 ml-2">{result.details.successful}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Users in DB:</span>
                        <span className="text-white ml-2">{result.details.userCount}</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Has updated_at:</span>
                        <span className={`ml-2 ${result.details.hasUpdatedAtColumn ? 'text-green-400' : 'text-red-400'}`}>
                          {result.details.hasUpdatedAtColumn ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    
                    {result.nextSteps && (
                      <div className="mt-4">
                        <h5 className="font-medium text-white mb-2">Next Steps:</h5>
                        <ul className="space-y-1 text-sm text-slate-300">
                          {result.nextSteps.map((step: string, index: number) => (
                            <li key={index}>• {step}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {!result.success && result.error && (
                  <div className="mt-4 p-4 bg-red-500/10 rounded-lg">
                    <h4 className="font-semibold text-red-400 mb-2">Error Details:</h4>
                    <p className="text-sm text-red-300 font-mono">{result.error}</p>
                  </div>
                )}
              </div>
            )}

            {result?.success && (
              <div className="text-center">
                <Button asChild variant="outline">
                  <a href="/login">Try Login Again</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

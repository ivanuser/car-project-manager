"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GradientBackground } from "@/components/gradient-background";
import { CajproLogo } from "@/components/cajpro-logo";
import { Particles } from "@/components/particles";

// Import auth hook
import { useAuth } from "@/hooks/auth/useAuth";

export default function ResetPasswordPage() {
  const { confirmResetPassword, loading, error } = useAuth();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get token from query params
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    
    // Validation
    if (password.length < 8) {
      setValidationError("Password must be at least 8 characters long");
      return;
    }
    
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }
    
    if (!token) {
      setValidationError("Missing reset token. Please check your reset link.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await confirmResetPassword(token, password, confirmPassword);
      // The confirmResetPassword function already handles navigation to login
    } catch (err) {
      setIsSubmitting(false);
    }
  };

  const renderMissingTokenError = () => (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <GradientBackground intensity="strong" />
      <Particles quantity={50} speed={0.5} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-6">
            <CajproLogo size="lg" />
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-4">Invalid Reset Link</h1>
        </div>

        <div className="max-w-md w-full mx-auto">
          <Card className="w-full bg-background/90 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader>
              <div className="w-full flex justify-center mb-4">
                <div className="p-3 rounded-full bg-destructive/10">
                  <AlertCircle className="h-10 w-10 text-destructive" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Missing Reset Token</CardTitle>
              <CardDescription className="text-center">
                The password reset link is invalid or expired.
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center text-muted-foreground">
              <p>Please request a new password reset link to continue.</p>
            </CardContent>

            <CardFooter className="flex justify-center">
              <Link href="/forgot-password">
                <Button>Request New Reset Link</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );

  // If token is missing, show error
  if (!token) {
    return renderMissingTokenError();
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      {/* Background elements */}
      <GradientBackground intensity="strong" />
      <Particles quantity={50} speed={0.5} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-6">
            <CajproLogo size="lg" />
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-4">Reset Password</h1>
          <p className="text-gray-200 max-w-md">
            Create a new secure password for your account
          </p>
        </div>

        <div className="max-w-md w-full mx-auto">
          <Card className="w-full bg-background/90 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Create New Password</CardTitle>
              <CardDescription className="text-center">
                Your password must be at least 8 characters
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                      minLength={8}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="sr-only">
                        {showConfirmPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </div>

                {(error || validationError) && (
                  <Alert variant="destructive">
                    <AlertDescription>{error || validationError}</AlertDescription>
                  </Alert>
                )}
              </CardContent>

              <CardFooter>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
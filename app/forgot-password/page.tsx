"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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

export default function ForgotPasswordPage() {
  const { resetPassword, loading, error } = useAuth();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await resetPassword(email);
      // The resetPassword function already handles navigation to the confirmation page
    } catch (error) {
      console.error("Password reset request error:", error);
      setIsSubmitting(false);
    }
  };

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
          
          <h1 className="text-4xl font-bold text-white mb-4">Forgot Password</h1>
          <p className="text-gray-200 max-w-md">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>

        <div className="max-w-md w-full mx-auto">
          <Card className="w-full bg-background/90 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Reset Your Password</CardTitle>
              <CardDescription className="text-center">
                Enter your email address below
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    required
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </CardContent>

              <CardFooter className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending instructions...
                    </>
                  ) : (
                    "Send Reset Instructions"
                  )}
                </Button>
                
                <div className="text-center w-full">
                  <Link 
                    href="/login" 
                    className="text-sm text-primary hover:underline"
                  >
                    Back to login
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
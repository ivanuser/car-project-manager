"use client";

import React from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientBackground } from "@/components/gradient-background";
import { CajproLogo } from "@/components/cajpro-logo";
import { Particles } from "@/components/particles";

export default function ForgotPasswordConfirmationPage() {
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
          
          <h1 className="text-4xl font-bold text-white mb-4">Check Your Email</h1>
        </div>

        <div className="max-w-md w-full mx-auto">
          <Card className="w-full bg-background/90 backdrop-blur-md border-border/50 shadow-lg">
            <CardHeader>
              <div className="w-full flex justify-center mb-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <MailCheck className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center">Email Sent</CardTitle>
              <CardDescription className="text-center">
                If an account exists with the email you provided, we've sent password reset instructions.
              </CardDescription>
            </CardHeader>

            <CardContent className="text-center text-muted-foreground">
              <p>Please check your email and follow the instructions to reset your password. The link will expire in 1 hour.</p>
              <p className="mt-4">If you don't receive an email within a few minutes, check your spam folder or try again.</p>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Link href="/login" className="w-full">
                <Button className="w-full" variant="outline">
                  Return to Login
                </Button>
              </Link>
              
              <Link href="/forgot-password" className="w-full">
                <Button className="w-full" variant="ghost">
                  Try Different Email
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { CajproLogo } from "@/components/cajpro-logo";
import { GradientBackground } from "@/components/gradient-background";
import { Particles } from "@/components/particles";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

// Loading component for Suspense
function ResetPasswordLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <GradientBackground intensity="strong" />
      <Particles quantity={50} speed={0.5} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-6">
            <CajproLogo size="lg" />
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-4">Reset Password</h1>
          <p className="text-gray-200 max-w-md">Loading...</p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Wrench, DollarSign, Camera, Calendar, BarChart3, Users, Shield } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8 text-blue-400" />
            <h1 className="text-2xl font-bold text-white">CAJ-Pro</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Custom Auto Journey
            <span className="block text-blue-400">Project Manager</span>
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            The ultimate platform for tracking, managing, and documenting your car project builds. 
            From planning to completion, CAJ-Pro keeps everything organized.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/register">Start Your Project</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">View Demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Everything You Need</h2>
          <p className="text-xl text-slate-300">Complete project management for automotive enthusiasts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <Wrench className="h-12 w-12 text-blue-400 mb-4" />
              <CardTitle className="text-white">Project Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Track build stages, set milestones, and organize tasks. 
                Keep your project on schedule with timeline visualization.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <DollarSign className="h-12 w-12 text-green-400 mb-4" />
              <CardTitle className="text-white">Budget Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Monitor expenses, track receipts, and stay within budget. 
                Get insights into spending patterns and cost breakdowns.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <Camera className="h-12 w-12 text-purple-400 mb-4" />
              <CardTitle className="text-white">Photo Gallery</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Document your progress with organized photo galleries. 
                Before/after comparisons and milestone documentation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <Wrench className="h-12 w-12 text-orange-400 mb-4" />
              <CardTitle className="text-white">Parts Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Manage parts, track orders, and organize inventory. 
                Never lose track of what you have and what you need.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <Calendar className="h-12 w-12 text-red-400 mb-4" />
              <CardTitle className="text-white">Task Scheduling</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Plan and schedule maintenance, upgrades, and repairs. 
                Set reminders and track completion status.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-cyan-400 mb-4" />
              <CardTitle className="text-white">Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300">
                Get insights into project progress, budget utilization, 
                and time tracking with detailed reports.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-6">Why Choose CAJ-Pro?</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Shield className="h-6 w-6 text-blue-400 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Secure & Private</h3>
                  <p className="text-slate-300">Your project data is encrypted and secure. No sharing, no ads.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Users className="h-6 w-6 text-green-400 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Built by Enthusiasts</h3>
                  <p className="text-slate-300">Created by car enthusiasts who understand your needs.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Wrench className="h-6 w-6 text-purple-400 mt-1" />
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">All-in-One Solution</h3>
                  <p className="text-slate-300">Everything you need in one place. No more scattered spreadsheets.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/5 p-8 rounded-lg border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-4">Ready to Start?</h3>
            <p className="text-slate-300 mb-6">
              Join thousands of automotive enthusiasts who trust CAJ-Pro to manage their builds.
            </p>
            <Button size="lg" className="w-full" asChild>
              <Link href="/register">Create Your Account</Link>
            </Button>
            <p className="text-sm text-slate-400 mt-4 text-center">
              Already have an account? <Link href="/login" className="text-blue-400 hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Car className="h-6 w-6 text-blue-400" />
            <span className="text-lg font-semibold text-white">CAJ-Pro</span>
          </div>
          <p className="text-slate-400">
            © 2025 Custom Auto Journey Pro. Built for automotive enthusiasts.
          </p>
        </div>
      </footer>
    </div>
  );
}

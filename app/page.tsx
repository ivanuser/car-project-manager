main2
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <main className="container mx-auto px-4 py-16">
        <h1 className="text-5xl font-bold text-white mb-8">Welcome to CarMod Manager</h1>
        <p className="text-xl text-white mb-8">
          Track, manage, and showcase your car modification projects with ease.
        </p>
        <div className="space-x-4">
          <Link href="/signup" className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-100 transition duration-300">
            Sign Up
          </Link>
          <Link href="/login" className="bg-transparent border-2 border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-purple-600 transition duration-300">
            Log In
          </Link>
        </div>
      </main>
    </div>
  );
}

import { Navbar } from "@/components/landing/navbar"
import { Hero } from "@/components/landing/hero"
import { Features } from "@/components/landing/features"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Pricing } from "@/components/landing/pricing"
import { Testimonials } from "@/components/landing/testimonials"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"
import { Toaster } from "@/components/ui/toaster"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-16">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTA />
      </main>
      <Footer />
      <Toaster />
    </div>
  )
}
main

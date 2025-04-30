import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AnimatedBackground } from "@/components/animated-background"

export function Hero() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <AnimatedBackground particleCount={100} connectionDistance={150} className="opacity-50" />

      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/80 backdrop-blur-sm z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Transform</span> Your Vehicle Projects
          </h1>
          <p className="text-xl md:text-2xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            Track, manage, and optimize your vehicle builds with the most comprehensive project management platform for
            automotive enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark"
            >
              <Link href="/login?tab=register">Start Your First Project</Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/demo">Try Demo</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/#features">See Features</Link>
            </Button>
          </div>

          <div className="mt-12 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 rounded-lg blur-xl"></div>
            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-lg overflow-hidden shadow-xl">
              <div className="aspect-video w-full bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center">
                <img src="/connected-commute.png" alt="CAJPRO Dashboard Preview" className="w-full h-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTA() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Transform Your Vehicle Projects?</h2>
          <p className="text-xl text-foreground/70 mb-8 max-w-2xl mx-auto">
            Join thousands of car enthusiasts who are already using CAJPRO to manage their builds more efficiently.
          </p>
          <Button
            size="lg"
            asChild
            className="bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark"
          >
            <Link href="/login?tab=register">Get Started for Free</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

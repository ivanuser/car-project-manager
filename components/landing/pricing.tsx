import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Hobbyist",
    price: "Free",
    description: "Perfect for individual enthusiasts with 1-2 projects",
    features: [
      "Up to 2 vehicle projects",
      "Basic task management",
      "Parts inventory tracking",
      "1GB storage for photos",
      "Email support",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Enthusiast",
    price: "$9.99",
    period: "per month",
    description: "Ideal for serious car enthusiasts with multiple projects",
    features: [
      "Up to 10 vehicle projects",
      "Advanced task management",
      "Comprehensive parts tracking",
      "10GB storage for photos & documents",
      "Priority email support",
      "Project sharing with 3 collaborators",
      "Custom project templates",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Professional",
    price: "$24.99",
    period: "per month",
    description: "For shops and professional builders",
    features: [
      "Unlimited vehicle projects",
      "Team task management",
      "Advanced parts & inventory system",
      "50GB storage",
      "Priority phone & email support",
      "Unlimited collaborators",
      "Custom branding",
      "Client access portal",
      "API access",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include core features with no hidden fees.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`bg-card rounded-lg overflow-hidden border ${
                plan.popular ? "border-primary shadow-lg relative" : "border-border/50"
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && <span className="text-foreground/70 ml-1">{plan.period}</span>}
                </div>
                <p className="text-foreground/70 mb-6">{plan.description}</p>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark"
                      : ""
                  }`}
                  variant={plan.popular ? "default" : "outline"}
                  asChild
                >
                  <Link href="/login?tab=register">{plan.cta}</Link>
                </Button>
              </div>
              <div className="bg-muted/50 p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <Check className="h-5 w-5 text-accent mr-2 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

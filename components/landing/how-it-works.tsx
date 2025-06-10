import { Check } from "lucide-react"

const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Sign up for CAJPRO in seconds and set up your profile.",
    points: ["Secure authentication", "Personalized dashboard", "Cloud-based storage"],
  },
  {
    number: "02",
    title: "Add Your Projects",
    description: "Create detailed profiles for each of your vehicle projects.",
    points: ["Multiple vehicle support", "Comprehensive details", "Custom categories"],
  },
  {
    number: "03",
    title: "Track Progress",
    description: "Manage tasks, parts, and timelines for each project.",
    points: ["Visual progress tracking", "Task management", "Parts inventory"],
  },
  {
    number: "04",
    title: "Complete Projects",
    description: "Finish your builds with complete documentation and history.",
    points: ["Project archives", "Exportable records", "Before & after comparisons"],
  },
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">How CAJPRO Works</h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Get started in minutes and transform how you manage your vehicle projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-card rounded-lg p-6 shadow-sm border border-border/50 h-full">
                <div className="text-4xl font-bold text-primary/20 mb-4">{step.number}</div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-foreground/70 mb-4">{step.description}</p>
                <ul className="space-y-2">
                  {step.points.map((point, i) => (
                    <li key={i} className="flex items-center">
                      <Check className="h-5 w-5 text-accent mr-2 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="w-8 h-0.5 bg-border"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

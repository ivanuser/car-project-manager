import { Car, PenToolIcon as Tool, Package, FileText, Users, Clock } from "lucide-react"

const features = [
  {
    icon: Car,
    title: "Vehicle Management",
    description:
      "Track multiple vehicle projects with detailed information about make, model, year, and modifications.",
  },
  {
    icon: Tool,
    title: "Task Tracking",
    description: "Create, assign, and track tasks for each project with due dates, priorities, and status updates.",
  },
  {
    icon: Package,
    title: "Parts Inventory",
    description: "Manage your parts inventory, track purchases, and monitor costs for each project.",
  },
  {
    icon: FileText,
    title: "Documentation",
    description: "Store important documents, receipts, and notes for each project in one centralized location.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description: "Share projects with friends, mechanics, or team members to collaborate on builds.",
  },
  {
    icon: Clock,
    title: "Progress Tracking",
    description: "Monitor project progress with visual timelines, milestones, and completion percentages.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features for Car Enthusiasts</h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Everything you need to manage your vehicle projects from start to finish, all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card rounded-lg p-6 shadow-sm border border-border/50 hover:shadow-md transition-shadow"
            >
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-foreground/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

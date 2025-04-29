import { Star } from "lucide-react"

const testimonials = [
  {
    quote:
      "CAJPRO has completely transformed how I manage my restoration projects. I can track every part, every task, and every dollar spent in one place.",
    author: "Michael R.",
    title: "Classic Car Restorer",
    rating: 5,
  },
  {
    quote:
      "As a shop owner, keeping track of multiple client projects used to be a nightmare. With CAJPRO, I can manage everything efficiently and provide clients with detailed progress updates.",
    author: "Sarah T.",
    title: "Custom Shop Owner",
    rating: 5,
  },
  {
    quote:
      "The parts inventory feature alone is worth the price. No more ordering duplicates or forgetting what I've already purchased. This app has saved me hundreds of dollars.",
    author: "James L.",
    title: "Weekend Mechanic",
    rating: 4,
  },
]

export function Testimonials() {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-foreground/70 max-w-3xl mx-auto">
            Join thousands of car enthusiasts who have transformed their project management with CAJPRO.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card rounded-lg p-6 shadow-sm border border-border/50">
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="italic mb-4">"{testimonial.quote}"</p>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-foreground/70">{testimonial.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

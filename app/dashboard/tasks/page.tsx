import { Card, CardContent } from "@/components/ui/card"

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground">Manage tasks across all your vehicle projects.</p>
      </div>

      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">Task management coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}

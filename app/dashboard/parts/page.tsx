import { Card, CardContent } from "@/components/ui/card"

export default function PartsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Parts</h2>
        <p className="text-muted-foreground">Manage parts inventory across all your vehicle projects.</p>
      </div>

      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground mb-4">Parts inventory management coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}

import Link from "next/link"
import { getAllParts } from "@/actions/parts-actions"
import { PartsList } from "@/components/parts/parts-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, AlertTriangle, Database } from "lucide-react"

export default async function PartsPage() {
  const { data: parts = [], error } = await getAllParts()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Parts</h2>
          <p className="text-muted-foreground">Manage parts inventory across all your vehicle projects.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/parts/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Part
          </Link>
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Error loading parts</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/fix-parts-schema">
                <Database className="mr-2 h-4 w-4" />
                Fix Parts Schema
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <PartsList parts={parts} showProject={true} />
      )}
    </div>
  )
}

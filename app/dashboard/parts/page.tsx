import { getAllParts } from "@/actions/parts-actions"
import { PartsList } from "@/components/parts/parts-list"

export default async function PartsPage() {
  const { data: parts = [], error } = await getAllParts()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Parts</h2>
        <p className="text-muted-foreground">Manage parts inventory across all your vehicle projects.</p>
      </div>

      {error ? (
        <div className="p-4 bg-destructive/10 text-destructive rounded-md">
          <p>Error loading parts: {error}</p>
        </div>
      ) : (
        <PartsList parts={parts} showProject={true} />
      )}
    </div>
  )
}

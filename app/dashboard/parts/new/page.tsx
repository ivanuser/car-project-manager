import Link from "next/link"
import { getVehicleProjects } from "@/actions/project-actions"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { PartForm } from "@/components/parts/part-form"

export default async function NewPartPage() {
  // Get all available projects for the dropdown
  const projects = await getVehicleProjects()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/parts">
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Add New Part</h1>
        </div>
      </div>

      <Card className="p-6">
        <PartForm projects={projects} />
      </Card>
    </div>
  )
}

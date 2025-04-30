import { notFound } from "next/navigation"
import { getVehicleProject } from "@/actions/project-actions"
import { getVendors } from "@/actions/parts-actions"
import { PartForm } from "@/components/parts/part-form"

interface NewPartPageProps {
  params: {
    id: string
  }
}

export default async function NewPartPage({ params }: NewPartPageProps) {
  const project = await getVehicleProject(params.id)
  const { data: vendors = [] } = await getVendors()

  if (!project) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <PartForm projectId={params.id} vendors={vendors} />
      </div>
    </div>
  )
}

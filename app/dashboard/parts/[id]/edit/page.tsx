import { notFound } from "next/navigation"
import { getPart, getVendors } from "@/actions/parts-actions"
import { PartForm } from "@/components/parts/part-form"

interface EditPartPageProps {
  params: {
    id: string
  }
}

export default async function EditPartPage({ params }: EditPartPageProps) {
  const { data: part, error } = await getPart(params.id)
  const { data: vendors = [] } = await getVendors()

  if (error || !part) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <PartForm
          projectId={part.project_id}
          defaultValues={{
            id: part.id,
            name: part.name,
            description: part.description || "",
            partNumber: part.part_number || "",
            price: part.price?.toString() || "",
            quantity: part.quantity.toString(),
            status: part.status,
            condition: part.condition || "",
            location: part.location || "",
            vendorId: part.vendor_id || "",
            purchaseDate: part.purchase_date ? new Date(part.purchase_date) : undefined,
            purchaseUrl: part.purchase_url || "",
            notes: part.notes || "",
            image_url: part.image_url,
          }}
          isEditing={true}
          vendors={vendors}
        />
      </div>
    </div>
  )
}

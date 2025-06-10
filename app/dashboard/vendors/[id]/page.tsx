import { notFound } from "next/navigation"
import { getVendor } from "@/actions/vendor-actions"
import { getPartsByVendorId } from "@/actions/parts-actions"
import { VendorDetail } from "@/components/vendors/vendor-detail"

interface VendorPageProps {
  params: {
    id: string
  }
}

export default async function VendorPage({ params }: VendorPageProps) {
  const { data: vendor, error } = await getVendor(params.id)
  const parts = await getPartsByVendorId(params.id)

  if (error || !vendor) {
    notFound()
  }

  return <VendorDetail vendor={vendor} parts={parts} />
}

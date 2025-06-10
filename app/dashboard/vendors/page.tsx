import type { Metadata } from "next"
import { getAllVendors } from "@/actions/vendor-actions"
import { VendorsList } from "@/components/vendors/vendors-list"
import { VendorStats } from "@/components/vendors/vendor-stats"

export const metadata: Metadata = {
  title: "Vendors | CAJPRO",
  description: "Manage your parts suppliers and service providers",
}

export default async function VendorsPage() {
  const { data: vendors = [] } = await getAllVendors()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vendors</h1>
        <p className="text-muted-foreground">Manage your parts suppliers, service providers, and other vendors.</p>
      </div>

      <VendorStats vendors={vendors} />
      <VendorsList vendors={vendors} />
    </div>
  )
}

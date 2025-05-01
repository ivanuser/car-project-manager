"use client"

import { useEffect, useState } from "react"
import { Building2, CircleDollarSign, Package, Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getVendorSpendingAnalytics } from "@/actions/vendor-actions"
import { formatCurrency } from "@/lib/utils"

type Vendor = {
  id: string
  name: string
  website: string | null
  phone: string | null
  email: string | null
  address: string | null
  category: string | null
  rating: number | null
  notes: string | null
  contact_name: string | null
  contact_position: string | null
  created_at: string
  updated_at: string
  user_id: string
}

type VendorStatsProps = {
  vendors: Vendor[]
}

type VendorSpending = {
  id: string
  name: string
  totalSpent: number
  partCount: number
}

export function VendorStats({ vendors }: VendorStatsProps) {
  const [spendingData, setSpendingData] = useState<VendorSpending[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSpendingData = async () => {
      try {
        const { data } = await getVendorSpendingAnalytics()
        if (data) {
          setSpendingData(data as VendorSpending[])
        }
      } catch (error) {
        console.error("Error fetching vendor spending data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSpendingData()
  }, [])

  // Calculate total spending across all vendors
  const totalSpending = spendingData.reduce((sum, vendor) => sum + vendor.totalSpent, 0)

  // Calculate total parts across all vendors
  const totalParts = spendingData.reduce((sum, vendor) => sum + vendor.partCount, 0)

  // Calculate average vendor rating
  const vendorsWithRatings = vendors.filter((v) => v.rating !== null)
  const averageRating =
    vendorsWithRatings.length > 0
      ? vendorsWithRatings.reduce((sum, vendor) => sum + (vendor.rating || 0), 0) / vendorsWithRatings.length
      : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{vendors.length}</div>
          <p className="text-xs text-muted-foreground">{vendors.filter((v) => v.category).length} categorized</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "Loading..." : formatCurrency(totalSpending)}</div>
          <p className="text-xs text-muted-foreground">Across {spendingData.length} vendors</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Parts Purchased</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{loading ? "Loading..." : totalParts}</div>
          <p className="text-xs text-muted-foreground">
            {loading ? "" : `${(totalParts / spendingData.length).toFixed(1)} parts per vendor`}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{vendorsWithRatings.length > 0 ? averageRating.toFixed(1) : "N/A"}</div>
          <p className="text-xs text-muted-foreground">From {vendorsWithRatings.length} rated vendors</p>
        </CardContent>
      </Card>
    </div>
  )
}

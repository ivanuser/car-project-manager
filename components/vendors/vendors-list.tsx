"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Building2, ExternalLink, Phone, Mail, Plus, Search, Star, StarOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { VendorDialog } from "@/components/vendors/vendor-dialog"

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

type VendorsListProps = {
  vendors: Vendor[]
}

const CATEGORY_COLORS: Record<string, string> = {
  "Parts Supplier": "bg-blue-500",
  "Service Provider": "bg-green-500",
  Dealership: "bg-purple-500",
  "Specialty Shop": "bg-amber-500",
  "Online Retailer": "bg-pink-500",
  Junkyard: "bg-gray-500",
  "Custom Fabrication": "bg-red-500",
  Other: "bg-slate-500",
}

export function VendorsList({ vendors }: VendorsListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [view, setView] = useState<"grid" | "table">("grid")
  const [dialogOpen, setDialogOpen] = useState(false)

  // Extract unique categories from vendors
  const categories = [...new Set(vendors.filter((v) => v.category).map((v) => v.category))]

  // Filter vendors based on search term and category
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vendor.contact_name && vendor.contact_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (vendor.notes && vendor.notes.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = categoryFilter === "all" || vendor.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-[300px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vendors..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category || ""}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Tabs value={view} onValueChange={(value) => setView(value as "grid" | "table")}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </div>
      </div>

      {filteredVendors.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No vendors found</h3>
          <p className="text-muted-foreground mt-2">
            {searchTerm || categoryFilter !== "all"
              ? "Try adjusting your search or filter criteria."
              : "Get started by adding your first vendor."}
          </p>
          <Button onClick={() => setDialogOpen(true)} className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Vendor
          </Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVendors.map((vendor) => (
            <Link key={vendor.id} href={`/dashboard/vendors/${vendor.id}`} className="block">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{vendor.name}</CardTitle>
                      {vendor.contact_name && <CardDescription>Contact: {vendor.contact_name}</CardDescription>}
                    </div>
                    {vendor.category && (
                      <Badge variant="secondary" className="ml-2">
                        <div
                          className={`mr-1.5 h-2 w-2 rounded-full ${CATEGORY_COLORS[vendor.category] || "bg-gray-500"}`}
                        />
                        {vendor.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    {vendor.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.email && (
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{vendor.email}</span>
                      </div>
                    )}
                    {vendor.rating !== null && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) =>
                          i < (vendor.rating || 0) ? (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff key={i} className="h-4 w-4 text-muted-foreground" />
                          ),
                        )}
                      </div>
                    )}
                    {vendor.notes && <p className="text-sm text-muted-foreground line-clamp-2">{vendor.notes}</p>}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="w-full flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Added {format(new Date(vendor.created_at), "MMM d, yyyy")}
                    </span>
                    {vendor.website && (
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Website <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell>
                    <Link href={`/dashboard/vendors/${vendor.id}`} className="font-medium hover:underline">
                      {vendor.name}
                    </Link>
                    {vendor.website && (
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center gap-1 mt-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Website <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </TableCell>
                  <TableCell>
                    {vendor.category ? (
                      <Badge variant="secondary">
                        <div
                          className={`mr-1.5 h-2 w-2 rounded-full ${CATEGORY_COLORS[vendor.category] || "bg-gray-500"}`}
                        />
                        {vendor.category}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{vendor.contact_name || "—"}</TableCell>
                  <TableCell>{vendor.phone || "—"}</TableCell>
                  <TableCell>{vendor.email || "—"}</TableCell>
                  <TableCell>
                    {vendor.rating !== null ? (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) =>
                          i < (vendor.rating || 0) ? (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff key={i} className="h-4 w-4 text-muted-foreground" />
                          ),
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{format(new Date(vendor.created_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <VendorDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

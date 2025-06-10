"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeft,
  Building2,
  Calendar,
  CircleDollarSign,
  Edit,
  ExternalLink,
  Mail,
  MapPin,
  Package,
  Phone,
  Star,
  StarOff,
  Trash2,
  User,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { deleteVendor } from "@/actions/vendor-actions"
import { formatCurrency } from "@/lib/utils"
import { VendorDialog } from "@/components/vendors/vendor-dialog"
import { PartsList } from "@/components/parts/parts-list"

interface Vendor {
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

interface VendorDetailProps {
  vendor: Vendor
  parts: any[]
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

export function VendorDetail({ vendor, parts }: VendorDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Calculate total spending with this vendor
  const totalSpending = parts.reduce((sum, part) => {
    const price = part.price || 0
    const quantity = part.quantity || 1
    return sum + price * quantity
  }, 0)

  const handleDeleteVendor = async () => {
    setIsDeleting(true)
    setDeleteError(null)

    try {
      const result = await deleteVendor(vendor.id)

      if (result.error) {
        setDeleteError(result.error)
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Vendor deleted successfully",
        })
        router.push(`/dashboard/vendors`)
      }
    } catch (error) {
      console.error("Error deleting vendor:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/vendors">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{vendor.name}</h2>
            {vendor.category && (
              <Badge variant="secondary" className="mt-1">
                <div className={`mr-1.5 h-2 w-2 rounded-full ${CATEGORY_COLORS[vendor.category] || "bg-gray-500"}`} />
                {vendor.category}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Vendor
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete the vendor "{vendor.name}". This action cannot be undone.
                  {parts.length > 0 && (
                    <p className="mt-2 font-semibold text-destructive">
                      Warning: This vendor has {parts.length} associated parts. Deleting this vendor will remove the
                      vendor association from these parts.
                    </p>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteError && <div className="text-sm text-destructive mt-2 mb-4">{deleteError}</div>}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteVendor}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Vendor details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Vendor Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="space-y-3">
                  {vendor.contact_name && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{vendor.contact_name}</p>
                        {vendor.contact_position && (
                          <p className="text-xs text-muted-foreground">{vendor.contact_position}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {vendor.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a href={`tel:${vendor.phone}`} className="text-sm hover:underline">
                        {vendor.phone}
                      </a>
                    </div>
                  )}

                  {vendor.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${vendor.email}`} className="text-sm hover:underline">
                        {vendor.email}
                      </a>
                    </div>
                  )}

                  {vendor.website && (
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={vendor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                      >
                        {vendor.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}

                  {vendor.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div className="text-sm">
                        {vendor.address.split(",").map((line, i) => (
                          <div key={i}>{line.trim()}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Vendor Information</h3>
                <div className="space-y-3">
                  {vendor.rating !== null && (
                    <div>
                      <p className="text-sm font-medium mb-1">Rating</p>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) =>
                          i < (vendor.rating || 0) ? (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ) : (
                            <StarOff key={i} className="h-4 w-4 text-muted-foreground" />
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-medium mb-1">Parts Purchased</p>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{parts.length} parts</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-1">Total Spending</p>
                    <div className="flex items-center gap-2">
                      <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{formatCurrency(totalSpending)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {vendor.notes && (
              <>
                <Separator />
                <div>
                  <h3 className="text-lg font-medium mb-2">Notes</h3>
                  <p className="text-sm">{vendor.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Vendor metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[24px_1fr] gap-x-2 gap-y-3 items-center">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Category</p>
                <p className="text-sm">{vendor.category || "Not specified"}</p>
              </div>

              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Added On</p>
                <p className="text-sm">{format(new Date(vendor.created_at), "PPP")}</p>
              </div>

              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm">{format(new Date(vendor.updated_at), "PPP")}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/vendors">View All Vendors</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Parts from this vendor */}
      {parts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-tight">Parts from this Vendor</h3>
          <PartsList parts={parts} showProject={true} />
        </div>
      )}

      <VendorDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} vendor={vendor} />
    </div>
  )
}

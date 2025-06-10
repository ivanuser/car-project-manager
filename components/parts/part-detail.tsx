"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, Calendar, CircleDollarSign, Edit, ExternalLink, MapPin, Package, Tag, Trash2 } from "lucide-react"

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
import { deletePart } from "@/actions/parts-actions"
import { formatCurrency } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface Part {
  id: string
  name: string
  description: string | null
  part_number: string | null
  price: number | null
  quantity: number
  status: string
  condition: string | null
  location: string | null
  project_id: string
  vendor_id: string | null
  purchase_date: string | null
  purchase_url: string | null
  image_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  vehicle_projects?: {
    id: string
    title: string
    make: string
    model: string
    year: number | null
  }
  vendors?: {
    id: string
    name: string
    website: string | null
  } | null
}

interface PartDetailProps {
  part: Part
}

const STATUS_COLORS: Record<string, string> = {
  needed: "bg-yellow-500",
  ordered: "bg-blue-500",
  received: "bg-green-500",
  installed: "bg-purple-500",
  removed: "bg-red-500",
  replaced: "bg-orange-500",
  returned: "bg-gray-500",
}

const STATUS_LABELS: Record<string, string> = {
  needed: "Needed",
  ordered: "Ordered",
  received: "Received",
  installed: "Installed",
  removed: "Removed",
  replaced: "Replaced",
  returned: "Returned",
}

const CONDITION_LABELS: Record<string, string> = {
  new: "New",
  used_excellent: "Used - Excellent",
  used_good: "Used - Good",
  used_fair: "Used - Fair",
  used_poor: "Used - Poor",
  refurbished: "Refurbished",
  damaged: "Damaged",
}

export function PartDetail({ part }: PartDetailProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleDeletePart = async () => {
    setIsDeleting(true)
    try {
      const result = await deletePart(part.id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Part deleted successfully",
        })
        router.push(`/dashboard/projects/${part.project_id}?tab=parts`)
      }
    } catch (error) {
      console.error("Error deleting part:", error)
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
            <Link href={`/dashboard/projects/${part.project_id}?tab=parts`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{part.name}</h2>
            {part.part_number && <p className="text-muted-foreground">Part #: {part.part_number}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/parts/${part.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Part
            </Link>
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
                  This will permanently delete the part "{part.name}". This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeletePart}
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
        {/* Part image and description */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Part Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-6">
              {part.image_url ? (
                <div className="w-full md:w-1/3">
                  <img
                    src={part.image_url || "/placeholder.svg"}
                    alt={part.name}
                    className="w-full h-auto rounded-md object-cover"
                  />
                </div>
              ) : (
                <div className="w-full md:w-1/3 flex items-center justify-center h-48 bg-muted rounded-md">
                  <Package className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              <div className="w-full md:w-2/3 space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Description</h3>
                  {part.description ? (
                    <p>{part.description}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No description provided</p>
                  )}
                </div>

                {part.notes && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Notes</h3>
                    <p>{part.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Status</h4>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[part.status] || "bg-gray-500"}`} />
                      <span>{STATUS_LABELS[part.status] || part.status}</span>
                    </div>
                  </div>

                  {part.condition && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Condition</h4>
                      <span>{CONDITION_LABELS[part.condition] || part.condition}</span>
                    </div>
                  )}

                  {part.location && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{part.location}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Project Information</h3>
                {part.vehicle_projects ? (
                  <div className="space-y-2">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Project</h4>
                      <Link
                        href={`/dashboard/projects/${part.vehicle_projects.id}`}
                        className="text-primary hover:underline"
                      >
                        {part.vehicle_projects.title}
                      </Link>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Vehicle</h4>
                      <p>
                        {part.vehicle_projects.make} {part.vehicle_projects.model}{" "}
                        {part.vehicle_projects.year && `(${part.vehicle_projects.year})`}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No project information available</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Purchase Information</h3>
                <div className="space-y-2">
                  {part.price ? (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
                      <div className="flex items-center gap-1">
                        <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>{formatCurrency(part.price)}</span>
                        {part.quantity > 1 && (
                          <Badge variant="outline" className="ml-1">
                            x{part.quantity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
                      <p className="text-muted-foreground italic">Not specified</p>
                    </div>
                  )}

                  {part.vendors ? (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Vendor</h4>
                      <div>
                        <span>{part.vendors.name}</span>
                        {part.vendors.website && (
                          <a
                            href={part.vendors.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline mt-1"
                          >
                            Visit website <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Vendor</h4>
                      <p className="text-muted-foreground italic">Not specified</p>
                    </div>
                  )}

                  {part.purchase_date ? (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Purchase Date</h4>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(part.purchase_date), "PPP")}</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Purchase Date</h4>
                      <p className="text-muted-foreground italic">Not specified</p>
                    </div>
                  )}

                  {part.purchase_url && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Purchase Link</h4>
                      <a
                        href={part.purchase_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        View product <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Part Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[24px_1fr] gap-x-2 gap-y-3 items-center">
              <Tag className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Part Number</p>
                <p className="text-sm">{part.part_number || "Not specified"}</p>
              </div>

              <Package className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Quantity</p>
                <p className="text-sm">{part.quantity}</p>
              </div>

              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Added On</p>
                <p className="text-sm">{format(new Date(part.created_at), "PPP")}</p>
              </div>

              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm">{format(new Date(part.updated_at), "PPP")}</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/dashboard/projects/${part.project_id}?tab=parts`}>View All Parts</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

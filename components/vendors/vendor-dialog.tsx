"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createVendor, updateVendor } from "@/actions/vendor-actions"

type VendorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vendor?: any
}

const VENDOR_CATEGORIES = [
  "Parts Supplier",
  "Service Provider",
  "Dealership",
  "Specialty Shop",
  "Online Retailer",
  "Junkyard",
  "Custom Fabrication",
  "Other",
]

export function VendorDialog({ open, onOpenChange, vendor }: VendorDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      // If we have a vendor, we're updating
      if (vendor?.id) {
        const result = await updateVendor(vendor.id, formData)
        if (result.success) {
          toast({
            title: "Vendor updated",
            description: "The vendor has been updated successfully.",
          })
          onOpenChange(false)
          router.refresh()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update vendor",
            variant: "destructive",
          })
        }
      } else {
        // Otherwise, we're creating
        const result = await createVendor(formData)
        if (result.success) {
          toast({
            title: "Vendor created",
            description: "The vendor has been created successfully.",
          })
          onOpenChange(false)
          router.refresh()
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create vendor",
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{vendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
          <DialogDescription>
            {vendor ? "Update the vendor's information below." : "Enter the details of the new vendor."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Vendor Name *</Label>
              <Input id="name" name="name" defaultValue={vendor?.name || ""} required placeholder="e.g. AutoZone" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select name="category" defaultValue={vendor?.category || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {VENDOR_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Contact Name</Label>
              <Input
                id="contact_name"
                name="contact_name"
                defaultValue={vendor?.contact_name || ""}
                placeholder="e.g. John Smith"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_position">Contact Position</Label>
              <Input
                id="contact_position"
                name="contact_position"
                defaultValue={vendor?.contact_position || ""}
                placeholder="e.g. Sales Manager"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={vendor?.phone || ""} placeholder="e.g. (555) 123-4567" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={vendor?.email || ""}
                placeholder="e.g. contact@autozone.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={vendor?.website || ""}
              placeholder="e.g. https://www.autozone.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              defaultValue={vendor?.address || ""}
              placeholder="e.g. 123 Main St, Anytown, CA 12345"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <Select name="rating" defaultValue={vendor?.rating?.toString() || ""}>
              <SelectTrigger>
                <SelectValue placeholder="Select rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="-1">No Rating</SelectItem>
                <SelectItem value="1">1 - Poor</SelectItem>
                <SelectItem value="2">2 - Fair</SelectItem>
                <SelectItem value="3">3 - Average</SelectItem>
                <SelectItem value="4">4 - Good</SelectItem>
                <SelectItem value="5">5 - Excellent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={vendor?.notes || ""}
              placeholder="Additional notes about this vendor..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {vendor ? "Update Vendor" : "Add Vendor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

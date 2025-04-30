"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { createPart, updatePart, getAllVendors, createVendor } from "@/actions/parts-actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Plus } from "lucide-react"

type Vendor = {
  id: string
  name: string
  website?: string
}

type Project = {
  id: string
  name: string
}

type PartFormProps = {
  part?: any
  projects: Project[]
  projectId?: string
}

export function PartForm({ part, projects, projectId }: PartFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState(part?.image_url || "")
  const [imagePreview, setImagePreview] = useState(part?.image_url || "")

  useEffect(() => {
    const loadVendors = async () => {
      const vendorData = await getAllVendors()
      setVendors(vendorData)
    }
    loadVendors()
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)

      // If we have a part, we're updating
      if (part?.id) {
        formData.append("id", part.id)
        const result = await updatePart(formData)
        if (result.success) {
          toast({
            title: "Part updated",
            description: "The part has been updated successfully.",
          })
          router.push(`/dashboard/parts/${part.id}`)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to update part",
            variant: "destructive",
          })
        }
      } else {
        // Otherwise, we're creating
        const result = await createPart(formData)
        if (result.success) {
          toast({
            title: "Part created",
            description: "The part has been created successfully.",
          })
          router.push(`/dashboard/projects/${formData.get("project_id")}`)
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to create part",
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

  const handleAddVendor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await createVendor(formData)

      if (result.success) {
        toast({
          title: "Vendor added",
          description: "The vendor has been added successfully.",
        })
        setVendors([...vendors, result.data])
        setVendorDialogOpen(false)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to add vendor",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding vendor:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value
    setImageUrl(url)
    setImagePreview(url)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={part?.name || ""}
                required
                placeholder="e.g. Front Brake Pads"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="part_number">Part Number</Label>
              <Input
                id="part_number"
                name="part_number"
                defaultValue={part?.part_number || ""}
                placeholder="e.g. BP-1234"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={part?.description || ""}
              placeholder="Describe the part..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select name="status" defaultValue={part?.status || "needed"}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="removed">Removed from Vehicle</SelectItem>
                  <SelectItem value="needed">Needed</SelectItem>
                  <SelectItem value="purchased">Purchased</SelectItem>
                  <SelectItem value="installed">Installed</SelectItem>
                  <SelectItem value="spare">Spare</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_id">Project *</Label>
              <Select name="project_id" defaultValue={part?.project_id || projectId || ""} disabled={!!projectId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="vendor_id">Vendor</Label>
                <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" variant="ghost" size="sm">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Vendor</DialogTitle>
                      <DialogDescription>Enter the details of the new vendor.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddVendor} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="vendor-name">Vendor Name *</Label>
                        <Input id="vendor-name" name="name" required placeholder="e.g. AutoZone" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vendor-website">Website</Label>
                        <Input
                          id="vendor-website"
                          name="website"
                          type="url"
                          placeholder="e.g. https://www.autozone.com"
                        />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="vendor-phone">Phone</Label>
                          <Input id="vendor-phone" name="phone" placeholder="e.g. (555) 123-4567" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="vendor-email">Email</Label>
                          <Input id="vendor-email" name="email" type="email" placeholder="e.g. contact@autozone.com" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vendor-notes">Notes</Label>
                        <Textarea
                          id="vendor-notes"
                          name="notes"
                          placeholder="Additional notes about this vendor..."
                          rows={3}
                        />
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setVendorDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Add Vendor
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <Select name="vendor_id" defaultValue={part?.vendor_id || ""}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {vendors.map((vendor) => (
                    <SelectItem key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_url">Purchase URL</Label>
              <Input
                id="purchase_url"
                name="purchase_url"
                type="url"
                defaultValue={part?.purchase_url || ""}
                placeholder="e.g. https://www.autozone.com/brakes/..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={part?.price || ""}
                placeholder="e.g. 49.99"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="1"
                defaultValue={part?.quantity || "1"}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Storage Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={part?.location || ""}
                placeholder="e.g. Garage Shelf 3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              value={imageUrl}
              onChange={handleImageChange}
              placeholder="e.g. https://example.com/part-image.jpg"
            />
            {imagePreview && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-1">Image Preview:</p>
                <div className="relative h-40 w-40 overflow-hidden rounded-md border">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Part preview"
                    fill
                    className="object-cover"
                    onError={() => setImagePreview("")}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={part?.notes || ""}
              placeholder="Additional notes about this part..."
              rows={4}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {part ? "Update Part" : "Add Part"}
          </Button>
        </div>
      </form>
    </div>
  )
}

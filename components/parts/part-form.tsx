"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { createPart, updatePart } from "@/actions/parts-actions"
import { getAllVendors } from "@/actions/vendor-actions"

// Define the form schema with Zod
const partFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  partNumber: z.string().optional(),
  price: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  quantity: z.coerce.number().min(1).default(1),
  status: z.enum(["needed", "ordered", "received", "installed", "returned"]),
  condition: z.string().optional(),
  location: z.string().optional(),
  vendorId: z.string().optional(),
  notes: z.string().optional(),
  projectId: z.string().min(1, "Please select a project"),
  purchaseDate: z.date().optional(),
  purchaseUrl: z.string().url().optional().or(z.literal("")),
})

// Infer the type from the schema
type PartFormValues = z.infer<typeof partFormSchema>

// Define the default values
const defaultValues: Partial<PartFormValues> = {
  name: "",
  description: "",
  partNumber: "",
  price: "",
  quantity: 1,
  status: "needed",
  condition: "",
  location: "",
  vendorId: "",
  notes: "",
  projectId: "",
  purchaseDate: undefined,
  purchaseUrl: "",
}

// Define the props for the PartForm component
interface PartFormProps {
  part?: any
  projects: any[]
  projectId?: string
}

export function PartForm({ part, projects, projectId }: PartFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vendors, setVendors] = useState<any[]>([])
  const [isLoadingVendors, setIsLoadingVendors] = useState(true)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(
    part?.image_url || null
  )

  // Load vendors on component mount
  useEffect(() => {
    async function loadVendors() {
      try {
        const result = await getAllVendors()
        if (result.data) {
          setVendors(result.data)
        } else if (result.error) {
          console.error("Error loading vendors:", result.error)
        }
      } catch (error) {
        console.error("Error loading vendors:", error)
      } finally {
        setIsLoadingVendors(false)
      }
    }
    loadVendors()
  }, [])

  // Initialize the form with react-hook-form
  const form = useForm<PartFormValues>({
    resolver: zodResolver(partFormSchema),
    defaultValues: part
      ? {
          name: part.name || "",
          description: part.description || "",
          partNumber: part.part_number || "",
          price: part.price || "",
          quantity: part.quantity || 1,
          status: part.status || "needed",
          condition: part.condition || "",
          location: part.location || "",
          vendorId: part.vendor_id || "",
          notes: part.notes || "",
          projectId: part.project_id || projectId || "",
          purchaseDate: part.purchase_date ? new Date(part.purchase_date) : undefined,
          purchaseUrl: part.purchase_url || "",
        }
      : {
          ...defaultValues,
          projectId: projectId || "",
        },
  })

  // Handle image selection
  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Remove selected image
  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(part?.image_url || null)
  }

  // Handle form submission
  async function onSubmit(data: PartFormValues) {
    console.log("PartForm: Starting part submission with data:", data)
    setIsSubmitting(true)
    try {
      // Convert form data to FormData object for server actions
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("description", data.description || "")
      formData.append("partNumber", data.partNumber || "")
      formData.append("price", data.price ? data.price.toString() : "")
      formData.append("quantity", data.quantity.toString())
      formData.append("status", data.status)
      formData.append("condition", data.condition || "")
      formData.append("location", data.location || "")
      formData.append("vendorId", data.vendorId || "")
      formData.append("notes", data.notes || "")
      
      if (data.projectId) {
        formData.append("projectId", data.projectId)
        console.log("PartForm: Using project ID:", data.projectId)
      } else {
        console.error("PartForm: No project ID provided!")
      }
      
      if (data.purchaseDate) {
        formData.append("purchaseDate", data.purchaseDate.toISOString())
      }
      if (data.purchaseUrl) {
        formData.append("purchaseUrl", data.purchaseUrl)
      }
      
      // Add image if selected
      if (selectedImage) {
        formData.append("image", selectedImage)
      }

      if (part) {
        // Update existing part
        console.log("PartForm: Updating existing part:", part.id)
        const result = await updatePart(part.id, formData)
        console.log("PartForm: Update result:", result)
        if (result.error) {
          throw new Error(result.error)
        }
        toast({
          title: "Part updated",
          description: "Your part has been updated successfully.",
        })
        router.push(`/dashboard/parts/${part.id}`)
        router.refresh()
      } else {
        // Create new part
        console.log("PartForm: Creating new part")
        const result = await createPart(formData)
        console.log("PartForm: Create result:", result)
        if (result.error) {
          throw new Error(result.error)
        }
        toast({
          title: "Part created",
          description: "Your part has been created successfully.",
        })
        if (projectId) {
          router.push(`/dashboard/projects/${projectId}`)
        } else {
          router.push("/dashboard/parts")
        }
        router.refresh()
      }
    } catch (error) {
      console.error("Error submitting part:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was an error submitting your part. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Part Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter part name" {...field} />
              </FormControl>
              <FormDescription>A clear, descriptive name for the part.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter part description" className="min-h-[100px]" {...field} />
              </FormControl>
              <FormDescription>Detailed description of the part and its purpose.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="partNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Part Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter part number" {...field} />
                </FormControl>
                <FormDescription>Manufacturer part number or SKU.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Enter price" 
                    value={value || ""}
                    onChange={(e) => {
                      const val = e.target.value
                      onChange(val === "" ? "" : parseFloat(val))
                    }}
                    {...field}
                  />
                </FormControl>
                <FormDescription>Cost of the part (optional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter additional notes about this part..." className="min-h-[80px]" {...field} />
              </FormControl>
              <FormDescription>Additional information, installation notes, specifications, etc.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input type="number" min="1" placeholder="Enter quantity" {...field} />
                </FormControl>
                <FormDescription>How many of this part do you need?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="needed">Needed</SelectItem>
                    <SelectItem value="ordered">Ordered</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="installed">Installed</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Current status of the part.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="condition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Condition</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="used">Used</SelectItem>
                    <SelectItem value="refurbished">Refurbished</SelectItem>
                    <SelectItem value="damaged">Damaged</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Physical condition of the part.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Storage Location</FormLabel>
                <FormControl>
                  <Input placeholder="Enter storage location" {...field} />
                </FormControl>
                <FormDescription>Where the part is stored (optional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!projectId}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Which project does this part belong to?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vendorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vendor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingVendors}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingVendors ? "Loading vendors..." : "Select vendor (optional)"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">No vendor</SelectItem>
                    {vendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>Supplier or vendor for this part (optional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Purchase Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                      >
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormDescription>When was this part purchased?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purchaseUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purchase URL</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="Enter purchase link" {...field} />
                </FormControl>
                <FormDescription>Link to where the part can be purchased.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <FormLabel>Part Image</FormLabel>
          
          {imagePreview && (
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Part preview" 
                className="h-32 w-32 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
              id="part-image"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('part-image')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              {imagePreview ? 'Change Image' : 'Upload Image'}
            </Button>
            <span className="text-sm text-muted-foreground">
              JPG, PNG, or GIF up to 10MB
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (projectId) {
                router.push(`/dashboard/projects/${projectId}`)
              } else {
                router.push("/dashboard/parts")
              }
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : part ? "Update Part" : "Create Part"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

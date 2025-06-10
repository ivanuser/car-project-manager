"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Loader2, Search, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EnhancedDatePicker } from "@/components/ui/enhanced-date-picker"
import { useToast } from "@/hooks/use-toast"
import { lookupVehicleByVin } from "@/actions/vin-actions"
import { updateVehicleProject } from "@/actions/project-actions"

const projectSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  make: z.string().min(1, { message: "Make is required" }),
  model: z.string().min(1, { message: "Model is required" }),
  year: z.string().refine((val) => !val || !isNaN(Number.parseInt(val)), {
    message: "Year must be a number",
  }),
  vin: z.string().optional(),
  projectType: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  budget: z
    .string()
    .refine((val) => !val || !isNaN(Number.parseFloat(val)), {
      message: "Budget must be a number",
    })
    .optional(),
  status: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof projectSchema>

interface ProjectFormProps {
  defaultValues?: Partial<ProjectFormValues> & { id?: string; thumbnail_url?: string }
  isEditing?: boolean
}

const PROJECT_TYPES = [
  { value: "restoration", label: "Restoration" },
  { value: "modification", label: "Modification" },
  { value: "performance", label: "Performance Upgrade" },
  { value: "maintenance", label: "Maintenance" },
  { value: "repair", label: "Repair" },
  { value: "custom", label: "Custom Build" },
]

const STATUS_OPTIONS = [
  { value: "planning", label: "Planning" },
  { value: "in_progress", label: "In Progress" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
]

export function ProjectForm({ defaultValues, isEditing = false }: ProjectFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLookingUpVin, setIsLookingUpVin] = useState(false)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(defaultValues?.thumbnail_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      make: defaultValues?.make || "",
      model: defaultValues?.model || "",
      year: defaultValues?.year?.toString() || "",
      vin: defaultValues?.vin || "",
      projectType: defaultValues?.projectType || "",
      startDate: defaultValues?.startDate ? new Date(defaultValues.startDate) : undefined,
      endDate: defaultValues?.endDate ? new Date(defaultValues.endDate) : undefined,
      budget: defaultValues?.budget?.toString() || "",
      status: defaultValues?.status || "planning",
    },
  })

  // Watch the date fields for changes to ensure UI updates
  const startDate = form.watch("startDate")
  const endDate = form.watch("endDate")
  const projectType = form.watch("projectType")
  const status = form.watch("status")

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setThumbnail(file)

      // Create preview URL
      const reader = new FileReader()
      reader.onload = () => {
        setThumbnailPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeThumbnail = () => {
    setThumbnail(null)
    setThumbnailPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleVinLookup = async () => {
    const vin = form.getValues("vin")
    if (!vin) {
      toast({
        title: "VIN Required",
        description: "Please enter a VIN to look up vehicle information",
        variant: "destructive",
      })
      return
    }

    setIsLookingUpVin(true)
    try {
      const result = await lookupVehicleByVin(vin)

      if (result.success && result.data) {
        form.setValue("make", result.data.make)
        form.setValue("model", result.data.model)
        form.setValue("year", result.data.year.toString())

        toast({
          title: "Vehicle Found",
          description: `Found ${result.data.year} ${result.data.make} ${result.data.model}`,
        })
      } else {
        toast({
          title: "VIN Lookup Failed",
          description: result.error || "Could not find vehicle information for this VIN",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("VIN lookup error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred during VIN lookup",
        variant: "destructive",
      })
    } finally {
      setIsLookingUpVin(false)
    }
  }

  async function onSubmit(data: ProjectFormValues) {
    console.log('🚀 Form onSubmit called with data:', data);
    setIsLoading(true)

    try {
      console.log('📋 Building FormData...');
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description || "")
      formData.append("make", data.make)
      formData.append("model", data.model)
      formData.append("year", data.year || "")
      formData.append("vin", data.vin || "")
      formData.append("projectType", data.projectType || "")

      if (data.startDate) {
        formData.append("startDate", format(data.startDate, "yyyy-MM-dd"))
      }

      if (data.endDate) {
        formData.append("endDate", format(data.endDate, "yyyy-MM-dd"))
      }

      formData.append("budget", data.budget || "")

      if (isEditing) {
        formData.append("status", data.status || "planning")
      }

      if (thumbnail) {
        formData.append("thumbnail", thumbnail)
      }

      console.log('📏 FormData built, entries:');
      for (const [key, value] of formData.entries()) {
        console.log(`   ${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
      }

      let result

      if (isEditing && defaultValues?.id) {
        console.log('🔄 Calling updateVehicleProject...');
        result = await updateVehicleProject(defaultValues.id, formData)
      } else {
        console.log('✨ Calling API /api/projects...');
        
        // Use API route instead of server action - use relative URL and include credentials
        const response = await fetch('/api/projects', {
          method: 'POST',
          body: formData,
          credentials: 'include' // Ensure cookies are sent
        });
        
        result = await response.json();
        console.log('📊 API response status:', response.status);
        console.log('📊 API response headers:', Object.fromEntries(response.headers.entries()));
        console.log('📊 API response body:', result);
        
        if (!response.ok) {
          result.error = result.error || `HTTP ${response.status}: ${response.statusText}`;
        }
      }
      
      console.log('📊 Server action result:', result);

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success) {
        toast({
          title: "Success",
          description: isEditing ? "Project updated successfully" : "Project created successfully",
        })

        if (isEditing && defaultValues?.id) {
          router.push(`/dashboard/projects/${defaultValues.id}`)
        } else {
          router.push("/dashboard")
        }

        router.refresh()
      }
    } catch (error) {
      console.error("Project submission error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEditing ? "Edit Vehicle Project" : "Create New Vehicle Project"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update the details of your vehicle project" : "Enter the details of your new vehicle project"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Project Title and Thumbnail */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input id="title" placeholder="My Awesome Build" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-sm text-error">{form.formState.errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Project Thumbnail</Label>
              <div className="flex flex-col items-center">
                {thumbnailPreview ? (
                  <div className="relative w-full h-32 mb-2">
                    <img
                      src={thumbnailPreview || "/placeholder.svg"}
                      alt="Project thumbnail"
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={removeThumbnail}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center mb-2 bg-muted/50">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleThumbnailChange}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  {thumbnailPreview ? "Change Image" : "Upload Image"}
                </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe your project goals and plans..."
              rows={4}
              {...form.register("description")}
            />
          </div>

          {/* VIN with Lookup */}
          <div className="space-y-2">
            <Label htmlFor="vin">VIN (Optional)</Label>
            <div className="flex space-x-2">
              <Input
                id="vin"
                placeholder="Vehicle Identification Number"
                {...form.register("vin")}
                className="flex-1"
              />
              <Button type="button" variant="secondary" onClick={handleVinLookup} disabled={isLookingUpVin}>
                {isLookingUpVin ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Lookup
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter a VIN to automatically populate make, model, and year information
            </p>
          </div>

          {/* Vehicle Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input id="make" placeholder="Toyota" {...form.register("make")} />
              {form.formState.errors.make && <p className="text-sm text-error">{form.formState.errors.make.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" placeholder="Supra" {...form.register("model")} />
              {form.formState.errors.model && (
                <p className="text-sm text-error">{form.formState.errors.model.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year (Optional)</Label>
              <Input id="year" placeholder="1998" {...form.register("year")} />
              {form.formState.errors.year && <p className="text-sm text-error">{form.formState.errors.year.message}</p>}
            </div>
          </div>

          {/* Project Type */}
          <div className="space-y-2">
            <Label htmlFor="projectType">Project Type</Label>
            <Select
              value={projectType || ""}
              onValueChange={(value) => form.setValue("projectType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Project Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <EnhancedDatePicker
                date={startDate}
                onDateChange={(date) => {
                  form.setValue("startDate", date)
                  form.trigger("startDate")
                }}
                placeholder="Pick start date"
              />
            </div>

            <div className="space-y-2">
              <Label>Projected End Date</Label>
              <EnhancedDatePicker
                date={endDate}
                onDateChange={(date) => {
                  form.setValue("endDate", date)
                  form.trigger("endDate")
                }}
                placeholder="Pick end date"
              />
            </div>
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <Label htmlFor="budget">Budget (Optional)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input id="budget" type="text" placeholder="5,000.00" className="pl-8" {...form.register("budget")} />
            </div>
            {form.formState.errors.budget && (
              <p className="text-sm text-error">{form.formState.errors.budget.message}</p>
            )}
          </div>

          {/* Status (only for editing) */}
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={status || "planning"} 
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((statusOption) => (
                    <SelectItem key={statusOption.value} value={statusOption.value}>
                      {statusOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Saving..." : "Creating..."}
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Create Project"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { File, Loader2, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { uploadDocument, updateDocument } from "@/actions/document-actions"

const MAX_FILE_SIZE = 20 * 1024 * 1024 // 20MB

const documentSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  projectId: z.string().optional(),
  version: z.string().optional(),
  isPublic: z.boolean().default(false),
  tags: z.string().optional(),
})

type DocumentFormValues = z.infer<typeof documentSchema>

interface DocumentUploadFormProps {
  categories: any[]
  projects: any[]
  defaultValues?: Partial<DocumentFormValues> & { id?: string; file_name?: string }
  isEditing?: boolean
}

export function DocumentUploadForm({
  categories,
  projects,
  defaultValues,
  isEditing = false,
}: DocumentUploadFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [tags, setTags] = useState<string[]>(defaultValues?.tags?.split(",") || [])
  const [newTag, setNewTag] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      categoryId: defaultValues?.categoryId || "",
      projectId: defaultValues?.projectId || "",
      version: defaultValues?.version || "",
      isPublic: defaultValues?.isPublic || false,
      tags: defaultValues?.tags || "",
    },
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: "Maximum file size is 20MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  async function onSubmit(data: DocumentFormValues) {
    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", data.title)
      formData.append("description", data.description || "")

      if (data.categoryId) {
        formData.append("categoryId", data.categoryId)
      }

      if (data.projectId) {
        formData.append("projectId", data.projectId)
      }

      if (data.version) {
        formData.append("version", data.version)
      }

      formData.append("isPublic", data.isPublic.toString())
      formData.append("tags", tags.join(","))

      if (selectedFile) {
        formData.append("file", selectedFile)
      } else if (!isEditing) {
        toast({
          title: "File Required",
          description: "Please select a file to upload",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      let result

      if (isEditing && defaultValues?.id) {
        result = await updateDocument(defaultValues.id, formData)
      } else {
        result = await uploadDocument(formData)
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success) {
        toast({
          title: "Success",
          description: isEditing ? "Document updated successfully" : "Document uploaded successfully",
        })

        if (isEditing && defaultValues?.id) {
          router.push(`/dashboard/documents/${defaultValues.id}`)
        } else {
          router.push("/dashboard/documents")
        }

        router.refresh()
      }
    } catch (error) {
      console.error("Document submission error:", error)
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
        <CardTitle>{isEditing ? "Edit Document" : "Upload Document"}</CardTitle>
        <CardDescription>
          {isEditing ? "Update document details" : "Upload and organize your project documents"}
        </CardDescription>
      </CardHeader>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Document Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input id="title" placeholder="Engine Manual" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the document..."
              rows={3}
              {...form.register("description")}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Document File {isEditing ? "(Optional)" : ""}</Label>
            <div className="flex flex-col items-center">
              {selectedFile ? (
                <div className="w-full p-4 border rounded-md mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <File className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : isEditing && defaultValues?.file_name ? (
                <div className="w-full p-4 border rounded-md mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    <File className="h-5 w-5 mr-2 text-primary" />
                    <div>
                      <p className="font-medium">{defaultValues.file_name}</p>
                      <p className="text-xs text-muted-foreground">Current file (keep as is)</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="w-full h-32 border-2 border-dashed rounded-md flex flex-col items-center justify-center mb-2 bg-muted/50 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Click to select or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PDF, Word, Excel, Images, etc. (Max 20MB)</p>
                </div>
              )}
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
              {!selectedFile && !isEditing && (
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Select File
                </Button>
              )}
              {isEditing && !selectedFile && (
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  Replace File
                </Button>
              )}
            </div>
          </div>

          {/* Category and Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category (Optional)</Label>
              <Select
                defaultValue={form.getValues("categoryId")}
                onValueChange={(value) => form.setValue("categoryId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project">Related Project (Optional)</Label>
              <Select
                defaultValue={form.getValues("projectId")}
                onValueChange={(value) => form.setValue("projectId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Version and Visibility */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="version">Version (Optional)</Label>
              <Input id="version" placeholder="1.0" {...form.register("version")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isPublic" className="block mb-2">
                Public Document
              </Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="isPublic"
                  checked={form.getValues("isPublic")}
                  onCheckedChange={(checked) => form.setValue("isPublic", checked)}
                />
                <Label htmlFor="isPublic" className="cursor-pointer">
                  {form.getValues("isPublic") ? "Public" : "Private"}
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">Public documents can be shared with others</p>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags (Optional)</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a tag"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                Add
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Saving..." : "Uploading..."}
              </>
            ) : isEditing ? (
              "Save Changes"
            ) : (
              "Upload Document"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

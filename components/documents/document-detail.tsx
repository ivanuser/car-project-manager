"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import {
  ArrowLeft,
  Download,
  Edit,
  File,
  FileCode,
  FileImage,
  FileIcon as FilePdf,
  FileSpreadsheet,
  FileText,
  Folder,
  Globe,
  Lock,
  Tag,
  Trash2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { deleteDocument } from "@/actions/document-actions"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DocumentDetailProps {
  document: any
}

export function DocumentDetail({ document }: DocumentDetailProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FilePdf className="h-16 w-16 text-red-500" />
    } else if (fileType.includes("image")) {
      return <FileImage className="h-16 w-16 text-blue-500" />
    } else if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType.includes("csv")) {
      return <FileSpreadsheet className="h-16 w-16 text-green-500" />
    } else if (fileType.includes("html") || fileType.includes("javascript") || fileType.includes("json")) {
      return <FileCode className="h-16 w-16 text-yellow-500" />
    } else {
      return <FileText className="h-16 w-16 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + " bytes"
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + " KB"
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + " MB"
    }
  }

  const handleDelete = async () => {
    try {
      const result = await deleteDocument(document.id, document.project_id)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Document deleted successfully",
        })
        router.push("/dashboard/documents")
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
    }
  }

  const isImage = document.file_type.includes("image")
  const isPdf = document.file_type.includes("pdf")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/documents">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <a href={document.file_url} target="_blank" rel="noopener noreferrer" download>
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/dashboard/documents/${document.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{document.title}</CardTitle>
            {document.description && <CardDescription>{document.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            {isImage ? (
              <div className="border rounded-md overflow-hidden">
                <img
                  src={document.file_url || "/placeholder.svg"}
                  alt={document.title}
                  className="w-full object-contain max-h-[500px]"
                />
              </div>
            ) : isPdf ? (
              <div className="border rounded-md overflow-hidden h-[500px]">
                <iframe src={`${document.file_url}#toolbar=0`} className="w-full h-full" title={document.title} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 border rounded-md">
                {getFileIcon(document.file_type)}
                <p className="mt-4 text-lg font-medium">{document.file_name}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(document.file_size)}</p>
                <Button className="mt-4" asChild>
                  <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                    Open File
                  </a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[24px_1fr] gap-x-2 gap-y-3 items-center">
              <File className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">File Name</p>
                <p className="text-sm break-all">{document.file_name}</p>
              </div>

              <div className="h-5 w-5 flex items-center justify-center">
                {document.is_public ? (
                  <Globe className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Lock className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">Visibility</p>
                <p className="text-sm">{document.is_public ? "Public" : "Private"}</p>
              </div>

              {document.document_categories && (
                <>
                  <Folder className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Category</p>
                    <p className="text-sm">{document.document_categories.name}</p>
                  </div>
                </>
              )}

              {document.vehicle_projects && (
                <>
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Project</p>
                    <Link
                      href={`/dashboard/projects/${document.vehicle_projects.id}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {document.vehicle_projects.title}
                    </Link>
                  </div>
                </>
              )}

              {document.version && (
                <>
                  <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Version</p>
                    <p className="text-sm">{document.version}</p>
                  </div>
                </>
              )}

              <div className="h-5 w-5 text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Added</p>
                <p className="text-sm">{format(new Date(document.created_at), "PPP")}</p>
              </div>

              <div className="h-5 w-5 text-muted-foreground">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 9h18" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium">Last Updated</p>
                <p className="text-sm">{format(new Date(document.updated_at), "PPP")}</p>
              </div>
            </div>

            {document.tags && document.tags.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag: any) => (
                    <Badge key={tag.id} variant="secondary">
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{document.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

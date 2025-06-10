"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import {
  File,
  FileText,
  FileIcon as FilePdf,
  FileImage,
  FileSpreadsheet,
  FileCode,
  Folder,
  MoreVertical,
  Pencil,
  Trash2,
  Download,
  Eye,
  Tag,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { Input } from "@/components/ui/input"

interface DocumentListProps {
  documents: any[]
  showProject?: boolean
}

export function DocumentList({ documents, showProject = false }: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<{ id: string; title: string; projectId?: string } | null>(
    null,
  )
  const { toast } = useToast()

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FilePdf className="h-10 w-10 text-red-500" />
    } else if (fileType.includes("image")) {
      return <FileImage className="h-10 w-10 text-blue-500" />
    } else if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType.includes("csv")) {
      return <FileSpreadsheet className="h-10 w-10 text-green-500" />
    } else if (fileType.includes("html") || fileType.includes("javascript") || fileType.includes("json")) {
      return <FileCode className="h-10 w-10 text-yellow-500" />
    } else {
      return <FileText className="h-10 w-10 text-gray-500" />
    }
  }

  const handleDelete = async () => {
    if (!documentToDelete) return

    try {
      const result = await deleteDocument(documentToDelete.id, documentToDelete.projectId)

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
      setDocumentToDelete(null)
    }
  }

  const confirmDelete = (id: string, title: string, projectId?: string) => {
    setDocumentToDelete({ id, title, projectId })
    setDeleteDialogOpen(true)
  }

  // Filter documents based on search term
  const filteredDocuments = documents.filter(
    (doc) =>
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.file_name && doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <p className="text-sm text-muted-foreground">
          {filteredDocuments.length} {filteredDocuments.length === 1 ? "document" : "documents"}
        </p>
      </div>

      {filteredDocuments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <File className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No documents found</p>
            <p className="text-sm text-muted-foreground mb-4">
              {searchTerm ? "Try a different search term" : "Upload your first document to get started"}
            </p>
            {!searchTerm && (
              <Button asChild>
                <Link href="/dashboard/documents/upload">Upload Document</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((document) => (
            <Card key={document.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    {getFileIcon(document.file_type)}
                    <div>
                      <h3 className="font-medium line-clamp-1">{document.title}</h3>
                      {document.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{document.description}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/documents/${document.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/documents/${document.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={document.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => confirmDelete(document.id, document.title, document.project_id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {document.document_categories && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Folder className="h-3 w-3" />
                      {document.document_categories.name}
                    </Badge>
                  )}

                  {document.version && <Badge variant="outline">v{document.version}</Badge>}

                  {document.is_public && <Badge>Public</Badge>}
                </div>

                {showProject && document.vehicle_projects && (
                  <div className="mt-2">
                    <Link
                      href={`/dashboard/projects/${document.vehicle_projects.id}`}
                      className="text-xs text-primary hover:underline flex items-center"
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {document.vehicle_projects.title}
                    </Link>
                  </div>
                )}

                <div className="mt-4 text-xs text-muted-foreground">
                  <p>Added {format(new Date(document.created_at), "MMM d, yyyy")}</p>
                  <p className="mt-1">{document.file_name}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{documentToDelete?.title}&quot;? This action cannot be undone.
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

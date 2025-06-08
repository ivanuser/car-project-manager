"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { 
  Camera, 
  FileText, 
  Receipt, 
  Download, 
  Eye, 
  Trash2, 
  Upload,
  Filter,
  Search,
  Image,
  File,
  Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getProjectPhotos, deletePhoto } from "@/actions/gallery-actions"
import { getDocuments, deleteDocument } from "@/actions/document-actions"
import { getProjectReceipts } from "@/actions/expense-actions-new"
import { formatDistanceToNow } from "date-fns"

interface FileManagerProps {
  projectId: string
  onUploadPhoto?: () => void
  onUploadDocument?: () => void
  onUploadReceipt?: () => void
}

interface ProjectFile {
  id: string
  name: string
  type: 'photo' | 'document' | 'receipt'
  url: string
  size?: number
  created_at: string
  category?: string
  vendor?: string
  amount?: number
}

export function FileManager({ 
  projectId, 
  onUploadPhoto, 
  onUploadDocument, 
  onUploadReceipt 
}: FileManagerProps) {
  const [files, setFiles] = useState<ProjectFile[]>([])
  const [filteredFiles, setFilteredFiles] = useState<ProjectFile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadFiles()
  }, [projectId])

  useEffect(() => {
    filterFiles()
  }, [files, searchTerm, filterType, activeTab])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const [photos, documents, receipts] = await Promise.all([
        getProjectPhotos(projectId),
        getDocuments(projectId),
        getProjectReceipts(projectId)
      ])

      const allFiles: ProjectFile[] = [
        ...photos.map((photo: any) => ({
          id: photo.id,
          name: photo.title || 'Untitled Photo',
          type: 'photo' as const,
          url: photo.photo_url,
          created_at: photo.created_at,
          category: photo.category
        })),
        ...documents.map((doc: any) => ({
          id: doc.id,
          name: doc.title,
          type: 'document' as const,
          url: doc.file_url,
          size: doc.file_size,
          created_at: doc.created_at,
          category: doc.category_name
        })),
        ...receipts.map((receipt: any) => ({
          id: receipt.id,
          name: receipt.title || `Receipt from ${receipt.vendor}`,
          type: 'receipt' as const,
          url: receipt.receipt_url,
          created_at: receipt.date,
          vendor: receipt.vendor,
          amount: receipt.amount
        }))
      ]

      setFiles(allFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()))
    } catch (error) {
      console.error('Error loading files:', error)
      toast({
        title: "Error loading files",
        description: "Failed to load project files",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterFiles = () => {
    let filtered = files

    // Filter by tab
    if (activeTab !== "all") {
      filtered = filtered.filter(file => file.type === activeTab)
    }

    // Filter by type (additional filter)
    if (filterType !== "all") {
      filtered = filtered.filter(file => file.type === filterType)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(file =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredFiles(filtered)
  }

  const handleDeleteFile = async (file: ProjectFile) => {
    if (!confirm(`Are you sure you want to delete "${file.name}"?`)) return

    try {
      let result
      switch (file.type) {
        case 'photo':
          result = await deletePhoto(file.id, projectId)
          break
        case 'document':
          result = await deleteDocument(file.id)
          break
        case 'receipt':
          // For receipts, we need to remove the receipt_url from the budget item
          // This would require a new action
          toast({
            title: "Not implemented",
            description: "Receipt deletion from this view is not yet implemented",
            variant: "destructive",
          })
          return
      }

      if (result?.error) {
        toast({
          title: "Delete failed",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "File deleted",
          description: `${file.name} has been deleted`,
        })
        loadFiles() // Reload files
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      toast({
        title: "Delete failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  const handleViewFile = (file: ProjectFile) => {
    window.open(file.url, '_blank')
  }

  const handleDownloadFile = (file: ProjectFile) => {
    const link = document.createElement('a')
    link.href = file.url
    link.download = file.name
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'photo':
        return <Image className="h-4 w-4" />
      case 'document':
        return <FileText className="h-4 w-4" />
      case 'receipt':
        return <Receipt className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'photo':
        return 'bg-blue-100 text-blue-800'
      case 'document':
        return 'bg-green-100 text-green-800'
      case 'receipt':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading files...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Project Files</CardTitle>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={onUploadPhoto}
              className="flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Photo
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onUploadDocument}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              Document
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onUploadReceipt}
              className="flex items-center gap-2"
            >
              <Receipt className="h-4 w-4" />
              Receipt
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="photo">Photos</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="receipt">Receipts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({files.length})</TabsTrigger>
            <TabsTrigger value="photo">
              Photos ({files.filter(f => f.type === 'photo').length})
            </TabsTrigger>
            <TabsTrigger value="document">
              Documents ({files.filter(f => f.type === 'document').length})
            </TabsTrigger>
            <TabsTrigger value="receipt">
              Receipts ({files.filter(f => f.type === 'receipt').length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <File className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filterType !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Upload some files to get started'
                  }
                </p>
                {!searchTerm && filterType === 'all' && (
                  <div className="flex gap-2 justify-center">
                    <Button size="sm" onClick={onUploadPhoto}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Files
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <Badge className={`text-xs ${getFileTypeColor(file.type)}`}>
                            {file.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>
                            {formatDistanceToNow(new Date(file.created_at), { addSuffix: true })}
                          </span>
                          {file.size && (
                            <span>{formatFileSize(file.size)}</span>
                          )}
                          {file.category && (
                            <span>Category: {file.category}</span>
                          )}
                          {file.vendor && (
                            <span>Vendor: {file.vendor}</span>
                          )}
                          {file.amount && (
                            <span>${file.amount}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewFile(file)}
                        title="View file"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDownloadFile(file)}
                        title="Download file"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteFile(file)}
                        title="Delete file"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

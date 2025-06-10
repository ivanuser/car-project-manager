"use client"

import { useState } from "react"
import { FileText, FileIcon as FilePdf, FileImage, FileSpreadsheet, Folder, Search, Download, Eye } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function DemoDocuments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Mock document data
  const documents = [
    {
      id: "1",
      title: "Engine Rebuild Manual",
      description: "Complete guide for rebuilding the V8 engine",
      file_type: "application/pdf",
      file_name: "v8-engine-rebuild-guide.pdf",
      category: { name: "Manuals" },
      created_at: "2023-05-15T10:30:00Z",
      tags: ["engine", "rebuild", "v8"],
      is_featured: true,
    },
    {
      id: "2",
      title: "Wiring Diagram",
      description: "Electrical system wiring diagram for the project",
      file_type: "image/jpeg",
      file_name: "wiring-diagram.jpg",
      category: { name: "Diagrams" },
      created_at: "2023-06-22T14:45:00Z",
      tags: ["electrical", "wiring"],
      is_featured: false,
    },
    {
      id: "3",
      title: "Parts Inventory",
      description: "Spreadsheet of all parts with costs and sources",
      file_type: "application/vnd.ms-excel",
      file_name: "parts-inventory.xlsx",
      category: { name: "Inventory" },
      created_at: "2023-07-10T09:15:00Z",
      tags: ["parts", "inventory", "costs"],
      is_featured: false,
    },
    {
      id: "4",
      title: "Paint Color Samples",
      description: "Color samples for exterior paint options",
      file_type: "image/png",
      file_name: "paint-samples.png",
      category: { name: "Design" },
      created_at: "2023-08-05T16:20:00Z",
      tags: ["paint", "design", "exterior"],
      is_featured: true,
    },
    {
      id: "5",
      title: "Service History",
      description: "Complete service history from previous owner",
      file_type: "application/pdf",
      file_name: "service-history.pdf",
      category: { name: "History" },
      created_at: "2023-04-18T11:10:00Z",
      tags: ["service", "history", "maintenance"],
      is_featured: false,
    },
    {
      id: "6",
      title: "Interior Restoration Plan",
      description: "Detailed plan for interior restoration with materials list",
      file_type: "application/pdf",
      file_name: "interior-restoration-plan.pdf",
      category: { name: "Plans" },
      created_at: "2023-09-01T13:25:00Z",
      tags: ["interior", "restoration", "upholstery"],
      is_featured: false,
    },
  ]

  // Mock categories
  const categories = [
    { id: "1", name: "Manuals", count: 3 },
    { id: "2", name: "Diagrams", count: 2 },
    { id: "3", name: "Inventory", count: 1 },
    { id: "4", name: "Design", count: 1 },
    { id: "5", name: "History", count: 1 },
    { id: "6", name: "Plans", count: 1 },
  ]

  // Filter documents based on search term and active tab
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (doc.file_name && doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()))

    if (activeTab === "all") return matchesSearch
    if (activeTab === "featured") return matchesSearch && doc.is_featured
    return matchesSearch && doc.category.name.toLowerCase() === activeTab.toLowerCase()
  })

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("pdf")) {
      return <FilePdf className="h-10 w-10 text-red-500" />
    } else if (fileType.includes("image")) {
      return <FileImage className="h-10 w-10 text-blue-500" />
    } else if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType.includes("csv")) {
      return <FileSpreadsheet className="h-10 w-10 text-green-500" />
    } else {
      return <FileText className="h-10 w-10 text-gray-500" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Documentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button>Upload</Button>
        </div>

        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="w-full justify-start">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            {categories.slice(0, 3).map((category) => (
              <TabsTrigger key={category.id} value={category.name.toLowerCase()}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDocuments.map((document) => (
                <Card key={document.id} className="overflow-hidden">
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      {getFileIcon(document.file_type)}
                      <div className="flex-1">
                        <h3 className="font-medium line-clamp-1">{document.title}</h3>
                        {document.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{document.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Folder className="h-3 w-3" />
                            {document.category.name}
                          </Badge>
                          {document.is_featured && <Badge>Featured</Badge>}
                        </div>
                        <div className="mt-2 flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

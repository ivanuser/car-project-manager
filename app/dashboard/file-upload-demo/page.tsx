"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Camera, 
  FileText, 
  Receipt, 
  Upload, 
  CheckCircle, 
  AlertCircle,
  Info,
  ExternalLink 
} from "lucide-react"
import { PhotoUploadForm } from "@/components/gallery/photo-upload-form"
import { DocumentUploadForm } from "@/components/documents/document-upload-form"
import { ReceiptScanner } from "@/components/expenses/receipt-scanner"
import { ReceiptUpload } from "@/components/expenses/receipt-upload"
import { FileManager } from "@/components/projects/file-manager"
import { EnhancedBudgetItemForm } from "@/components/budget/enhanced-budget-item-form"
import { Alert, AlertDescription } from "@/components/ui/alert"

const DEMO_PROJECT_ID = "demo-project-id"
const DEMO_BUDGET_ITEM_ID = "demo-budget-item-id"

const DEMO_CATEGORIES = [
  { id: "1", name: "Parts", description: "Auto parts and components" },
  { id: "2", name: "Tools", description: "Tools and equipment" },
  { id: "3", name: "Materials", description: "Raw materials and supplies" },
  { id: "4", name: "Labor", description: "Professional services" },
  { id: "5", name: "Miscellaneous", description: "Other expenses" }
]

const DEMO_PROJECTS = [
  { id: "1", title: "Demo Project - File Upload Testing" },
  { id: "2", title: "Sample Car Restoration" },
  { id: "3", title: "Engine Rebuild Project" }
]

export default function FileUploadDemoPage() {
  const [uploadStats, setUploadStats] = useState({
    photos: 0,
    documents: 0,
    receipts: 0
  })

  const handleUploadSuccess = (type: 'photos' | 'documents' | 'receipts') => {
    setUploadStats(prev => ({
      ...prev,
      [type]: prev[type] + 1
    }))
  }

  const handleReceiptScanComplete = (data: any) => {
    console.log('Receipt scan completed:', data)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">File Upload System Demo</h1>
          <p className="text-muted-foreground">
            Test and demonstrate the comprehensive file upload capabilities
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Camera className="h-3 w-3" />
            {uploadStats.photos} Photos
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {uploadStats.documents} Documents
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Receipt className="h-3 w-3" />
            {uploadStats.receipts} Receipts
          </Badge>
        </div>
      </div>

      {/* System Status */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This demo page showcases the complete file upload system with PostgreSQL database integration 
          and server-side file storage. All uploads are functional and will be stored in your configured storage directory.
        </AlertDescription>
      </Alert>

      {/* Main Demo Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="receipts">Receipts</TabsTrigger>
          <TabsTrigger value="budget">Budget Form</TabsTrigger>
          <TabsTrigger value="manager">File Manager</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  Photo Upload
                </CardTitle>
                <CardDescription>
                  Upload project photos with metadata, categories, and tags
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Multiple image formats
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Before/after comparison
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Automatic thumbnails
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Category organization
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  Document Upload
                </CardTitle>
                <CardDescription>
                  Store manuals, guides, and other project documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    PDF, Word, Excel support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Version control
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Tag management
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Public/private sharing
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-orange-600" />
                  Receipt Processing
                </CardTitle>
                <CardDescription>
                  OCR scanning and expense tracking integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    OCR text extraction
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Auto expense creation
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Vendor detection
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    Budget integration
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <CardDescription>
                How the file upload system works with your PostgreSQL database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">File Storage</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Server-side file system storage</li>
                    <li>• Organized by category and user</li>
                    <li>• Automatic unique filename generation</li>
                    <li>• Size and type validation</li>
                    <li>• Cleanup utilities for old files</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Database Integration</h4>
                  <ul className="text-sm space-y-1">
                    <li>• PostgreSQL with proper schemas</li>
                    <li>• File metadata and references</li>
                    <li>• User ownership and permissions</li>
                    <li>• Project association and organization</li>
                    <li>• Cascading deletes for cleanup</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Photo Upload Tab */}
        <TabsContent value="photos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Photo Upload Demo</CardTitle>
              <CardDescription>
                Upload photos with full metadata support, categories, and before/after comparison features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUploadForm 
                projectId={DEMO_PROJECT_ID}
                onSuccess={() => handleUploadSuccess('photos')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Document Upload Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Upload Demo</CardTitle>
              <CardDescription>
                Upload documents with categorization, version control, and tag management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUploadForm
                categories={DEMO_CATEGORIES}
                projects={DEMO_PROJECTS}
                onSuccess={() => handleUploadSuccess('documents')}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Receipt Processing Tab */}
        <TabsContent value="receipts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Receipt Scanner</CardTitle>
                <CardDescription>
                  Scan receipts with OCR to automatically extract expense data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReceiptScanner onScanComplete={handleReceiptScanComplete} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Receipt Upload</CardTitle>
                <CardDescription>
                  Direct receipt upload for budget items (requires existing budget item)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This component requires an existing budget item ID. Create a budget item first using the Budget Form tab.
                  </AlertDescription>
                </Alert>
                <ReceiptUpload 
                  budgetItemId={DEMO_BUDGET_ITEM_ID}
                  onUploadSuccess={() => handleUploadSuccess('receipts')}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced Budget Form Tab */}
        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Budget Form</CardTitle>
              <CardDescription>
                Create budget items with integrated receipt scanning and upload capabilities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EnhancedBudgetItemForm
                projectId={DEMO_PROJECT_ID}
                categories={DEMO_CATEGORIES}
                onSuccess={() => {
                  console.log('Budget item created successfully')
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Manager Tab */}
        <TabsContent value="manager" className="space-y-6">
          <FileManager
            projectId={DEMO_PROJECT_ID}
            onUploadPhoto={() => console.log('Upload photo clicked')}
            onUploadDocument={() => console.log('Upload document clicked')}
            onUploadReceipt={() => console.log('Upload receipt clicked')}
          />
        </TabsContent>
      </Tabs>

      {/* API Endpoints Information */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Available file upload endpoints for integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Photo Upload</h4>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                POST /api/uploads/photos
              </code>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Document Upload</h4>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                POST /api/uploads/documents
              </code>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-semibold text-sm mb-2">Receipt Upload</h4>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                POST /api/uploads/receipts
              </code>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

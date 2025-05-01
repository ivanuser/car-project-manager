import Link from "next/link"
import { Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getDocuments, getDocumentCategories } from "@/actions/document-actions"
import { getVehicleProjects } from "@/actions/project-actions"
import { DocumentList } from "@/components/documents/document-list"
import { CategoryManagement } from "@/components/documents/category-management"

export default async function DocumentsPage() {
  const documents = await getDocuments()
  const categories = await getDocumentCategories()
  const projects = await getVehicleProjects()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Documents</h2>
          <p className="text-muted-foreground">Manage and organize your project documentation</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/documents/upload">
            <Plus className="mr-2 h-4 w-4" />
            Upload Document
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Documents</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <DocumentList documents={documents} showProject={true} />
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <CategoryManagement categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

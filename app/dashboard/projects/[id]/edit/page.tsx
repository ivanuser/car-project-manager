"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ProjectForm } from "@/components/projects/project-form"
import { useToast } from "@/hooks/use-toast"

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function fetchProject() {
      try {
        const response = await fetch(`/api/projects/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch project")
        }
        const data = await response.json()
        setProject(data)
      } catch (error) {
        console.error("Error fetching project:", error)
        toast({
          title: "Error",
          description: "Failed to load project details",
          variant: "destructive",
        })
        router.push("/dashboard/projects")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [params.id, toast, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!project) {
    return null
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProjectForm
          defaultValues={{
            id: project.id,
            title: project.title,
            description: project.description,
            make: project.make,
            model: project.model,
            year: project.year,
            vin: project.vin,
            projectType: project.project_type,
            startDate: project.start_date,
            endDate: project.end_date,
            budget: project.budget,
            status: project.status,
            thumbnail_url: project.thumbnail_url,
          }}
          isEditing={true}
        />
      </div>
    </div>
  )
}

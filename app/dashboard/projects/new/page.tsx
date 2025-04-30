import { ProjectForm } from "@/components/projects/project-form"

export default function NewProjectPage() {
  // Mock projects data for development/preview
  const mockProjects = [{ id: "1", name: "Current Project" }]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProjectForm projects={mockProjects} projectId="1" />
      </div>
    </div>
  )
}

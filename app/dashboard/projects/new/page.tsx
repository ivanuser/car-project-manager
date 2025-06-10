import { ProjectForm } from "@/components/projects/project-form"

export default function NewProjectPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-muted-foreground mt-2">
            Start tracking your vehicle build with a new project. Add details about your car and set your goals.
          </p>
        </div>
        <ProjectForm />
      </div>
    </div>
  )
}

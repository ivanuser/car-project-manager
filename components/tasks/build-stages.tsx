import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BuildStagesProps {
  currentStage: string
  projectId?: string
}

export default function BuildStages({ currentStage, projectId }: BuildStagesProps) {
  const stages = [
    { id: "planning", name: "Planning" },
    { id: "teardown", name: "Teardown" },
    { id: "fabrication", name: "Fabrication" },
    { id: "assembly", name: "Assembly" },
    { id: "paint", name: "Paint" },
    { id: "electrical", name: "Electrical" },
    { id: "interior", name: "Interior" },
    { id: "testing", name: "Testing" },
    { id: "complete", name: "Complete" },
  ]

  // Find the index of the current stage
  const currentIndex = stages.findIndex((stage) => stage.id === currentStage)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build Progress</CardTitle>
        <CardDescription>Current stage: {stages.find((s) => s.id === currentStage)?.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.max(5, Math.min(100, (currentIndex / (stages.length - 1)) * 100))}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            {stages.map((stage, index) => {
              const isPast = index < currentIndex
              const isCurrent = index === currentIndex

              return (
                <div
                  key={stage.id}
                  className={`p-2 rounded-md text-center text-xs ${
                    isCurrent
                      ? "bg-primary text-primary-foreground font-medium"
                      : isPast
                        ? "bg-primary/20 text-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stage.name}
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

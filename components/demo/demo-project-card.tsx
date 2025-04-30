import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DemoProjectCardProps {
  title: string
  description: string
  progress: number
  image: string
  expanded?: boolean
}

export function DemoProjectCard({ title, description, progress, image, expanded }: DemoProjectCardProps) {
  return (
    <Card className={expanded ? "overflow-hidden" : "flex p-0 overflow-hidden"}>
      <div className={expanded ? "" : "hidden sm:block"}>
        <img
          src={image || "/placeholder.svg"}
          alt={title}
          className={expanded ? "w-full h-40 object-cover" : "h-full w-24 object-cover"}
        />
      </div>
      <div className={expanded ? "" : "flex-1"}>
        <CardContent className={expanded ? "pt-4" : "p-4"}>
          <div className="space-y-2">
            <h3 className="font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
        <CardFooter className={expanded ? "" : "px-4 pb-4 pt-0"}>
          <Button variant="ghost" className="w-full" disabled>
            View Project
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </div>
    </Card>
  )
}

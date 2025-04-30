import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DemoProjectCardProps {
  title: string
  progress: number
  image: string
  description?: string
}

export function DemoProjectCard({ title, progress, image, description }: DemoProjectCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-video relative">
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center gap-2">
        <Progress value={progress} className="h-2" />
        <span className="text-xs text-muted-foreground w-12">{progress}%</span>
      </CardFooter>
    </Card>
  )
}

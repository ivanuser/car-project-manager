import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface DemoProjectCardProps {
  title: string
  progress: number
  image?: string
  imageSrc?: string
  description?: string
  status?: string
  details?: Record<string, string | number>
}

export function DemoProjectCard({
  title,
  progress,
  image,
  imageSrc,
  description,
  status,
  details,
}: DemoProjectCardProps) {
  // Use imageSrc if provided, otherwise fall back to image
  const imageSource = imageSrc || image || "/car-project.png"

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imageSource || "/placeholder.svg"}
          alt={title}
          width={400}
          height={225}
          className="w-full h-full object-cover"
          priority
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>}
        {status && <p className="text-xs text-muted-foreground mt-1">{status}</p>}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center gap-2">
        <Progress value={progress} className="h-2" />
        <span className="text-xs text-muted-foreground w-12">{progress}%</span>
      </CardFooter>
    </Card>
  )
}

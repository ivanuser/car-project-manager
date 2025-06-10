import { notFound } from "next/navigation"
import { getPart } from "@/actions/parts-actions"
import { PartDetail } from "@/components/parts/part-detail"

interface PartPageProps {
  params: {
    id: string
  }
}

export default async function PartPage({ params }: PartPageProps) {
  const { data: part, error } = await getPart(params.id)

  if (error || !part) {
    notFound()
  }

  return <PartDetail part={part} />
}

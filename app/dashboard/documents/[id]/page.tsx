import { notFound } from "next/navigation"
import { getDocumentById } from "@/actions/document-actions"
import { DocumentDetail } from "@/components/documents/document-detail"

interface DocumentPageProps {
  params: {
    id: string
  }
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const document = await getDocumentById(params.id)

  if (!document) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <DocumentDetail document={document} />
    </div>
  )
}

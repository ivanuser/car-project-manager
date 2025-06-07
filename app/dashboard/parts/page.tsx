'use client'

import Link from "next/link"
import { getAllParts } from "@/actions/parts-actions"
import { PartsList } from "@/components/parts/parts-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, AlertTriangle, Database, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

// Prevent static generation
export const dynamic = 'force-dynamic'

interface Part {
  id: string
  name: string
  description?: string
  part_number?: string
  price?: number
  quantity: number
  status: string
  condition?: string
  location?: string
  notes?: string
  purchase_date?: string
  purchase_url?: string
  image_url?: string
  vehicle_projects?: {
    id: string
    title: string
    make: string
    model: string
    year?: number
  }
  vendors?: {
    id: string
    name: string
    website?: string
  }
}

export default function PartsPage() {
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadParts() {
      try {
        setLoading(true)
        setError(null)
        const result = await getAllParts()
        setParts(result.data || [])
        if (result.error) {
          setError(result.error)
        }
      } catch (err) {
        console.error('Error loading parts:', err)
        setError('Failed to load parts')
      } finally {
        setLoading(false)
      }
    }

    loadParts()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Parts</h2>
            <p className="text-muted-foreground">Manage parts inventory across all your vehicle projects.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/parts/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Part
            </Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading your parts inventory...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Parts</h2>
          <p className="text-muted-foreground">Manage parts inventory across all your vehicle projects.</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/parts/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Part
          </Link>
        </Button>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium mb-2">Error loading parts</p>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
              >
                Refresh Page
              </Button>
              <Button asChild>
                <Link href="/fix-parts-schema">
                  <Database className="mr-2 h-4 w-4" />
                  Fix Parts Schema
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <PartsList parts={parts} showProject={true} />
      )}
    </div>
  )
}

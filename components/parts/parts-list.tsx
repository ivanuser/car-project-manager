"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Package, ExternalLink, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"

type Part = {
  id: string
  name: string
  part_number: string | null
  description: string | null
  price: number | null
  quantity: number
  status: string
  condition: string | null
  location: string | null
  project_id: string
  vendor_id: string | null
  purchase_date: string | null
  purchase_url: string | null
  image_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
  vehicle_projects?: {
    id: string
    title: string
    make: string
    model: string
    year: number | null
  }
  vendors?: {
    id: string
    name: string
    website: string | null
  } | null
}

type PartsListProps = {
  parts: Part[]
  projectId?: string
  showProject?: boolean
}

const STATUS_COLORS: Record<string, string> = {
  needed: "bg-yellow-500",
  ordered: "bg-blue-500",
  received: "bg-green-500",
  installed: "bg-purple-500",
  removed: "bg-red-500",
  replaced: "bg-orange-500",
  returned: "bg-gray-500",
  purchased: "bg-green-500",
  spare: "bg-blue-300",
}

const STATUS_LABELS: Record<string, string> = {
  needed: "Needed",
  ordered: "Ordered",
  received: "Received",
  installed: "Installed",
  removed: "Removed",
  replaced: "Replaced",
  returned: "Returned",
  purchased: "Purchased",
  spare: "Spare",
}

export function PartsList({ parts, projectId, showProject = false }: PartsListProps) {
  const [filter, setFilter] = useState<string>("all")
  const [view, setView] = useState<"grid" | "table">("grid")

  const filteredParts = filter === "all" ? parts : parts.filter((part) => part.status === filter)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(value) => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parts</SelectItem>
              <SelectItem value="needed">Needed</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="purchased">Purchased</SelectItem>
              <SelectItem value="installed">Installed</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
              <SelectItem value="spare">Spare</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={view} onValueChange={(value) => setView(value as "grid" | "table")}>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="table">Table</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {projectId && (
          <Button asChild>
            <Link href={`/dashboard/projects/${projectId}/parts/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Add Part
            </Link>
          </Button>
        )}
      </div>

      {filteredParts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No parts found matching the selected filter.</p>
          {projectId && (
            <Button asChild className="mt-4">
              <Link href={`/dashboard/projects/${projectId}/parts/new`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Part
              </Link>
            </Button>
          )}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParts.map((part) => (
            <Link key={part.id} href={`/dashboard/parts/${part.id}`} className="block">
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{part.name}</CardTitle>
                      {part.part_number && <CardDescription>Part #: {part.part_number}</CardDescription>}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[part.status] || "bg-gray-500"}`} />
                      <span className="text-xs font-medium">{STATUS_LABELS[part.status] || part.status}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {part.image_url ? (
                    <div
                      className="h-32 w-full mb-3 overflow-hidden rounded-md bg-cover bg-center"
                      style={{ backgroundImage: `url(${part.image_url})` }}
                    />
                  ) : (
                    <div className="h-32 w-full mb-3 flex items-center justify-center bg-muted rounded-md">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                  <div className="space-y-1">
                    {showProject && part.vehicle_projects && (
                      <p className="text-sm">
                        <span className="font-medium">Project:</span> {part.vehicle_projects.title}
                      </p>
                    )}
                    {part.vendors && (
                      <p className="text-sm">
                        <span className="font-medium">Vendor:</span> {part.vendors.name}
                      </p>
                    )}
                    {part.price && (
                      <p className="text-sm">
                        <span className="font-medium">Price:</span> {formatCurrency(parseFloat(part.price))}
                        {part.quantity > 1 && ` × ${part.quantity}`}
                      </p>
                    )}
                    {part.location && (
                      <p className="text-sm">
                        <span className="font-medium">Location:</span> {part.location}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="w-full flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Added {format(new Date(part.created_at), "MMM d, yyyy")}
                    </span>
                    {part.purchase_url && (
                      <a
                        href={part.purchase_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Purchase Link <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Price</TableHead>
                {showProject && <TableHead>Project</TableHead>}
                <TableHead>Vendor</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell>
                    <Link href={`/dashboard/parts/${part.id}`} className="font-medium hover:underline">
                      {part.name}
                    </Link>
                    {part.part_number && (
                      <div className="text-xs text-muted-foreground">Part #: {part.part_number}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[part.status] || "bg-gray-500"}`} />
                      <span>{STATUS_LABELS[part.status] || part.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>{part.quantity}</TableCell>
                  <TableCell>{part.price ? formatCurrency(parseFloat(part.price)) : "—"}</TableCell>
                  {showProject && (
                    <TableCell>
                      {part.vehicle_projects ? (
                        <Link href={`/dashboard/projects/${part.vehicle_projects.id}`} className="hover:underline">
                          {part.vehicle_projects.title}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    {part.vendors ? (
                      <div>
                        {part.vendors.name}
                        {part.vendors.website && (
                          <a
                            href={part.vendors.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary flex items-center gap-1 mt-1"
                          >
                            Website <ExternalLink className="h-3 w-3" />
                          </a>
                        )}
                      </div>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>{part.location || "—"}</TableCell>
                  <TableCell>{format(new Date(part.created_at), "MMM d, yyyy")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

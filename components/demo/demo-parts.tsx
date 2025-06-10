"use client"

import { useState } from "react"
import { Package, ExternalLink, Plus, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

// Mock data for parts
const DEMO_PARTS = [
  {
    id: "1",
    name: "K&N Air Filter",
    part_number: "E-3750",
    description: "High-flow replacement air filter",
    price: 59.99,
    quantity: 1,
    status: "installed",
    condition: "new",
    location: "Engine Bay",
    project_id: "1",
    vendor_id: "1",
    purchase_date: "2023-04-15",
    purchase_url: "https://www.knfilters.com/",
    image_url: "/parts/air-filter.jpg",
    created_at: "2023-04-10T10:30:00Z",
    updated_at: "2023-04-15T14:20:00Z",
    vehicle_projects: {
      id: "1",
      title: "1967 Mustang Restoration",
      make: "Ford",
      model: "Mustang",
      year: 1967,
    },
    vendors: {
      id: "1",
      name: "K&N Performance",
      website: "https://www.knfilters.com/",
    },
  },
  {
    id: "2",
    name: "Bilstein B8 Shocks (Set of 4)",
    part_number: "24-142182",
    description: "Performance shock absorbers",
    price: 649.99,
    quantity: 1,
    status: "ordered",
    condition: "new",
    location: null,
    project_id: "3",
    vendor_id: "2",
    purchase_date: "2023-05-20",
    purchase_url: "https://www.bilstein.com/",
    image_url: "/parts/shocks.jpg",
    created_at: "2023-05-18T09:15:00Z",
    updated_at: "2023-05-20T11:45:00Z",
    vehicle_projects: {
      id: "3",
      title: "Jeep Wrangler Offroad Build",
      make: "Jeep",
      model: "Wrangler",
      year: 2020,
    },
    vendors: {
      id: "2",
      name: "Bilstein",
      website: "https://www.bilstein.com/",
    },
  },
  {
    id: "3",
    name: "Bosch Spark Plugs (Set of 6)",
    part_number: "4417",
    description: "Platinum spark plugs",
    price: 42.99,
    quantity: 1,
    status: "received",
    condition: "new",
    location: "Garage Cabinet A",
    project_id: "2",
    vendor_id: "3",
    purchase_date: "2023-06-05",
    purchase_url: "https://www.bosch.com/",
    image_url: "/parts/spark-plugs.jpg",
    created_at: "2023-06-01T15:20:00Z",
    updated_at: "2023-06-05T10:10:00Z",
    vehicle_projects: {
      id: "2",
      title: "BMW M3 Engine Swap",
      make: "BMW",
      model: "M3",
      year: 2015,
    },
    vendors: {
      id: "3",
      name: "Bosch",
      website: "https://www.bosch.com/",
    },
  },
  {
    id: "4",
    name: "Magnaflow Exhaust System",
    part_number: "19112",
    description: "Cat-back performance exhaust",
    price: 899.99,
    quantity: 1,
    status: "needed",
    condition: null,
    location: null,
    project_id: "1",
    vendor_id: "4",
    purchase_date: null,
    purchase_url: "https://www.magnaflow.com/",
    image_url: "/parts/exhaust.png",
    created_at: "2023-06-10T08:30:00Z",
    updated_at: "2023-06-10T08:30:00Z",
    vehicle_projects: {
      id: "1",
      title: "1967 Mustang Restoration",
      make: "Ford",
      model: "Mustang",
      year: 1967,
    },
    vendors: {
      id: "4",
      name: "Magnaflow",
      website: "https://www.magnaflow.com/",
    },
  },
  {
    id: "5",
    name: "BFGoodrich All-Terrain Tires (Set of 4)",
    part_number: "26775",
    description: "KO2 All-Terrain Tires 285/70R17",
    price: 1200.0,
    quantity: 1,
    status: "installed",
    condition: "new",
    location: "Vehicle",
    project_id: "3",
    vendor_id: "5",
    purchase_date: "2023-03-15",
    purchase_url: "https://www.bfgoodrichtires.com/",
    image_url: "/parts/tires.jpg",
    created_at: "2023-03-10T14:45:00Z",
    updated_at: "2023-03-20T16:30:00Z",
    vehicle_projects: {
      id: "3",
      title: "Jeep Wrangler Offroad Build",
      make: "Jeep",
      model: "Wrangler",
      year: 2020,
    },
    vendors: {
      id: "5",
      name: "Tire Rack",
      website: "https://www.tirerack.com/",
    },
  },
  {
    id: "6",
    name: "Edelbrock Carburetor",
    part_number: "1406",
    description: "600 CFM Square Bore 4-Barrel",
    price: 419.95,
    quantity: 1,
    status: "ordered",
    condition: "new",
    location: null,
    project_id: "1",
    vendor_id: "6",
    purchase_date: "2023-06-18",
    purchase_url: "https://www.edelbrock.com/",
    image_url: "/parts/carburetor.png",
    created_at: "2023-06-15T11:20:00Z",
    updated_at: "2023-06-18T09:15:00Z",
    vehicle_projects: {
      id: "1",
      title: "1967 Mustang Restoration",
      make: "Ford",
      model: "Mustang",
      year: 1967,
    },
    vendors: {
      id: "6",
      name: "Edelbrock",
      website: "https://www.edelbrock.com/",
    },
  },
]

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

export function DemoParts() {
  const [filter, setFilter] = useState<string>("all")
  const [view, setView] = useState<"grid" | "table">("grid")
  const [project, setProject] = useState<string>("all")

  const filteredParts = DEMO_PARTS.filter((part) => filter === "all" || part.status === filter).filter(
    (part) => project === "all" || part.vehicle_projects.id === project,
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filter} onValueChange={(value) => setFilter(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Parts</SelectItem>
              <SelectItem value="needed">Needed</SelectItem>
              <SelectItem value="ordered">Ordered</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="installed">Installed</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
              <SelectItem value="spare">Spare</SelectItem>
            </SelectContent>
          </Select>

          <Select value={project} onValueChange={(value) => setProject(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              <SelectItem value="1">1967 Mustang Restoration</SelectItem>
              <SelectItem value="2">BMW M3 Engine Swap</SelectItem>
              <SelectItem value="3">Jeep Wrangler Offroad Build</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={view} onValueChange={(value) => setView(value as "grid" | "table")} className="hidden sm:block">
            <TabsList>
              <TabsTrigger value="grid" className="flex items-center gap-1">
                <Grid className="h-4 w-4" />
                Grid
              </TabsTrigger>
              <TabsTrigger value="table" className="flex items-center gap-1">
                <List className="h-4 w-4" />
                Table
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <Button className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Part
        </Button>
      </div>

      {filteredParts.length === 0 ? (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg font-medium">No parts found</p>
          <p className="text-muted-foreground">No parts match your current filter criteria.</p>
          <Button className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Part
          </Button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredParts.map((part) => (
            <Card key={part.id} className="h-full hover:shadow-md transition-shadow">
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
                <div className="h-32 w-full mb-3 flex items-center justify-center bg-muted rounded-md">
                  {part.image_url ? (
                    <div className="relative h-full w-full">
                      <Image
                        src={part.image_url || "/placeholder.svg"}
                        alt={part.name}
                        className="object-cover rounded-md"
                        fill
                      />
                    </div>
                  ) : (
                    <Package className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-sm">
                    <span className="font-medium">Project:</span> {part.vehicle_projects.title}
                  </p>
                  {part.vendors && (
                    <p className="text-sm">
                      <span className="font-medium">Vendor:</span> {part.vendors.name}
                    </p>
                  )}
                  {part.price && (
                    <p className="text-sm">
                      <span className="font-medium">Price:</span> {formatCurrency(part.price)}
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
                  <span className="text-xs text-muted-foreground">Added {formatDate(part.created_at)}</span>
                  {part.purchase_url && (
                    <a
                      href="#"
                      onClick={(e) => e.preventDefault()}
                      className="text-xs text-primary flex items-center gap-1"
                    >
                      Purchase Link <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardFooter>
            </Card>
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
                <TableHead>Project</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Added</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredParts.map((part) => (
                <TableRow key={part.id}>
                  <TableCell>
                    <div className="font-medium hover:underline cursor-pointer">{part.name}</div>
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
                  <TableCell>{part.price ? formatCurrency(part.price) : "—"}</TableCell>
                  <TableCell>
                    <div className="hover:underline cursor-pointer">{part.vehicle_projects.title}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      {part.vendors.name}
                      {part.vendors.website && (
                        <a
                          href="#"
                          onClick={(e) => e.preventDefault()}
                          className="text-xs text-primary flex items-center gap-1 mt-1"
                        >
                          Website <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{part.location || "—"}</TableCell>
                  <TableCell>{formatDate(part.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

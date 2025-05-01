"use client"

import { useState } from "react"
import { Search, Plus, Star, StarHalf, Filter, ArrowUpDown, MoreHorizontal, Phone, Mail, MapPin } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/utils"

export function DemoVendors() {
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddVendor, setShowAddVendor] = useState(false)

  // Sample vendor data
  const vendors = [
    {
      id: "1",
      name: "AutoZone Parts",
      category: "Parts Supplier",
      rating: 4.5,
      totalSpent: 3250.75,
      partsCount: 28,
      address: "123 Main St, Anytown, USA",
      phone: "(555) 123-4567",
      email: "sales@autozone-example.com",
      website: "www.autozone-example.com",
      notes: "Great selection of OEM parts. Good prices on Mustang restoration parts.",
      lastOrder: "2 days ago",
    },
    {
      id: "2",
      name: "Performance Warehouse",
      category: "Performance Parts",
      rating: 5,
      totalSpent: 5120.5,
      partsCount: 15,
      address: "456 Engine Ave, Motorville, USA",
      phone: "(555) 987-6543",
      email: "info@performance-warehouse-example.com",
      website: "www.performance-warehouse-example.com",
      notes: "Specializes in high-performance engine components. Great customer service.",
      lastOrder: "1 week ago",
    },
    {
      id: "3",
      name: "Classic Car Restoration",
      category: "Restoration Services",
      rating: 4,
      totalSpent: 8750.25,
      partsCount: 12,
      address: "789 Vintage Rd, Classictown, USA",
      phone: "(555) 456-7890",
      email: "service@classic-restoration-example.com",
      website: "www.classic-restoration-example.com",
      notes: "Excellent quality work on body restoration. Slightly expensive but worth it.",
      lastOrder: "3 weeks ago",
    },
    {
      id: "4",
      name: "Discount Auto Parts",
      category: "Parts Supplier",
      rating: 3.5,
      totalSpent: 1250.3,
      partsCount: 22,
      address: "101 Budget Blvd, Savetown, USA",
      phone: "(555) 234-5678",
      email: "sales@discount-auto-example.com",
      website: "www.discount-auto-example.com",
      notes: "Good for basic maintenance parts. Quality can be hit or miss.",
      lastOrder: "1 month ago",
    },
    {
      id: "5",
      name: "Custom Paint & Body",
      category: "Body Shop",
      rating: 5,
      totalSpent: 4500.0,
      partsCount: 5,
      address: "202 Color Way, Paintville, USA",
      phone: "(555) 876-5432",
      email: "info@custom-paint-example.com",
      website: "www.custom-paint-example.com",
      notes: "Amazing custom paint work. Highly recommended for show cars.",
      lastOrder: "2 months ago",
    },
    {
      id: "6",
      name: "Elite Upholstery",
      category: "Interior",
      rating: 4.5,
      totalSpent: 2800.75,
      partsCount: 8,
      address: "303 Fabric St, Comfortville, USA",
      phone: "(555) 345-6789",
      email: "service@elite-upholstery-example.com",
      website: "www.elite-upholstery-example.com",
      notes: "Excellent custom interior work. Great attention to detail.",
      lastOrder: "3 months ago",
    },
  ]

  // Filter vendors based on search query and active tab
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.category.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === "all") return matchesSearch
    if (activeTab === "parts") return matchesSearch && vendor.category.includes("Parts")
    if (activeTab === "services") return matchesSearch && !vendor.category.includes("Parts")

    return matchesSearch
  })

  // Render star ratings
  const renderRating = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return <div className="flex">{stars}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Vendor Management</h2>
          <p className="text-muted-foreground">Track and manage your parts suppliers and service providers</p>
        </div>
        <Button className="flex items-center gap-2" onClick={() => setShowAddVendor(true)}>
          <Plus className="h-4 w-4" />
          Add Vendor
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {vendors.filter((v) => v.category.includes("Parts")).length} parts suppliers and{" "}
              {vendors.filter((v) => !v.category.includes("Parts")).length} service providers
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(vendors.reduce((sum, v) => sum + v.totalSpent, 0))}
            </div>
            <p className="text-xs text-muted-foreground">Across all vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Parts Ordered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vendors.reduce((sum, v) => sum + v.partsCount, 0)}</div>
            <p className="text-xs text-muted-foreground">From all vendors</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length).toFixed(1)}
            </div>
            <div className="flex items-center">
              {renderRating(vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search vendors..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Sort by Name</DropdownMenuItem>
            <DropdownMenuItem>Sort by Rating</DropdownMenuItem>
            <DropdownMenuItem>Sort by Total Spent</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Filter by Category</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" size="icon">
          <ArrowUpDown className="h-4 w-4" />
          <span className="sr-only">Sort</span>
        </Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Vendors</TabsTrigger>
          <TabsTrigger value="parts">Parts Suppliers</TabsTrigger>
          <TabsTrigger value="services">Service Providers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVendors.map((vendor) => (
              <Card key={vendor.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <CardTitle>{vendor.name}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Vendor</DropdownMenuItem>
                        <DropdownMenuItem>View Parts</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{vendor.category}</Badge>
                    <div className="flex">{renderRating(vendor.rating)}</div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{vendor.phone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{vendor.email}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{vendor.address}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Spent</p>
                    <p className="font-medium">{formatCurrency(vendor.totalSpent)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Parts</p>
                    <p className="font-medium text-center">{vendor.partsCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Last Order</p>
                    <p className="font-medium">{vendor.lastOrder}</p>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="parts" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVendors
              .filter((v) => v.category.includes("Parts"))
              .map((vendor) => (
                <Card key={vendor.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{vendor.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Vendor</DropdownMenuItem>
                          <DropdownMenuItem>View Parts</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{vendor.category}</Badge>
                      <div className="flex">{renderRating(vendor.rating)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{vendor.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{vendor.email}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                      <p className="font-medium">{formatCurrency(vendor.totalSpent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Parts</p>
                      <p className="font-medium text-center">{vendor.partsCount}</p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="services" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVendors
              .filter((v) => !v.category.includes("Parts"))
              .map((vendor) => (
                <Card key={vendor.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <CardTitle>{vendor.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View Details</DropdownMenuItem>
                          <DropdownMenuItem>Edit Vendor</DropdownMenuItem>
                          <DropdownMenuItem>View Services</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{vendor.category}</Badge>
                      <div className="flex">{renderRating(vendor.rating)}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{vendor.phone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-sm">{vendor.email}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                      <p className="font-medium">{formatCurrency(vendor.totalSpent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Services</p>
                      <p className="font-medium text-center">{vendor.partsCount}</p>
                    </div>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Spending by Vendor</CardTitle>
                <CardDescription>Total amount spent with each vendor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors
                    .sort((a, b) => b.totalSpent - a.totalSpent)
                    .slice(0, 5)
                    .map((vendor) => {
                      const percentage = (vendor.totalSpent / vendors.reduce((sum, v) => sum + v.totalSpent, 0)) * 100
                      return (
                        <div key={vendor.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{vendor.name}</p>
                            <p className="text-sm font-medium">{formatCurrency(vendor.totalSpent)}</p>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}% of total</p>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Categories</CardTitle>
                <CardDescription>Distribution of vendors by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  {/* Simple pie chart visualization */}
                  <div className="relative h-48 w-48">
                    <div className="absolute inset-0 rounded-full border-8 border-primary opacity-20"></div>
                    <div
                      className="absolute inset-0 rounded-full border-8 border-transparent border-t-primary border-r-primary border-b-primary"
                      style={{ transform: "rotate(45deg)" }}
                    ></div>
                    <div
                      className="absolute inset-0 rounded-full border-8 border-transparent border-t-secondary border-r-secondary"
                      style={{ transform: "rotate(135deg)" }}
                    ></div>
                    <div
                      className="absolute inset-0 rounded-full border-8 border-transparent border-t-accent"
                      style={{ transform: "rotate(270deg)" }}
                    ></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-sm font-medium">{vendors.length}</div>
                        <div className="text-xs text-muted-foreground">Total Vendors</div>
                      </div>
                    </div>
                  </div>

                  <div className="ml-8 space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary"></div>
                      <span className="text-sm">Parts Suppliers (33%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-secondary"></div>
                      <span className="text-sm">Service Providers (50%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-accent"></div>
                      <span className="text-sm">Other (17%)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendor Ratings</CardTitle>
                <CardDescription>Average ratings by vendor category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Parts Suppliers</p>
                      <div className="flex">{renderRating(4.0)}</div>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Body Shops</p>
                      <div className="flex">{renderRating(5.0)}</div>
                    </div>
                    <Progress value={100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Restoration Services</p>
                      <div className="flex">{renderRating(4.0)}</div>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Interior</p>
                      <div className="flex">{renderRating(4.5)}</div>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Parts by Vendor</CardTitle>
                <CardDescription>Number of parts ordered from each vendor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vendors
                    .sort((a, b) => b.partsCount - a.partsCount)
                    .slice(0, 5)
                    .map((vendor) => {
                      const percentage = (vendor.partsCount / vendors.reduce((sum, v) => sum + v.partsCount, 0)) * 100
                      return (
                        <div key={vendor.id} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">{vendor.name}</p>
                            <p className="text-sm font-medium">{vendor.partsCount} parts</p>
                          </div>
                          <Progress value={percentage} className="h-2" />
                          <p className="text-xs text-muted-foreground text-right">{percentage.toFixed(1)}% of total</p>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Vendor Dialog (simplified for demo) */}
      {showAddVendor && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-background border rounded-lg shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Vendor</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Vendor Name</label>
                <Input placeholder="Enter vendor name" />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input placeholder="e.g., Parts Supplier, Body Shop" />
              </div>
              <div>
                <label className="text-sm font-medium">Contact Information</label>
                <Input placeholder="Phone number" className="mb-2" />
                <Input placeholder="Email address" className="mb-2" />
                <Input placeholder="Website" />
              </div>
              <div>
                <label className="text-sm font-medium">Address</label>
                <Input placeholder="Street address" className="mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="City" />
                  <Input placeholder="State" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                  placeholder="Additional notes about this vendor"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddVendor(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowAddVendor(false)}>Add Vendor</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

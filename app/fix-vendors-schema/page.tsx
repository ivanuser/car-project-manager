"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, Loader2, Database } from "lucide-react"

export default function FixVendorsSchemaPage() {
  const [isFixing, setIsFixing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const runSchemaFix = async () => {
    setIsFixing(true)
    setError(null)

    try {
      const response = await fetch("/api/fix-vendors-schema", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()

      if (result.success) {
        setIsComplete(true)
        setTimeout(() => {
          router.push("/dashboard/vendors")
        }, 3000)
      } else {
        setError(result.error || "An unknown error occurred")
      }
    } catch (err) {
      console.error("Error fixing vendors schema:", err)
      setError("Failed to communicate with the server")
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-primary" />
              <div>
                <CardTitle>Fix Vendors Database Schema</CardTitle>
                <CardDescription>
                  Update the vendors table to support all vendor management features
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">What this fix will do:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Add missing vendor fields: category, contact_name, contact_position, address, rating
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Rename contact_email to email and contact_phone to phone for consistency
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Remove user_id from vendors (vendors are shared across all users)
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Add proper indexes for better performance
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  Preserve all existing vendor data
                </li>
              </ul>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}

            {isComplete && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Success!</strong> Vendors database schema has been fixed successfully. 
                  Redirecting to vendors page in 3 seconds...
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3">
              <Button 
                onClick={runSchemaFix} 
                disabled={isFixing || isComplete}
                className="flex-1"
              >
                {isFixing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isFixing ? "Fixing Schema..." : "Fix Vendors Schema"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => router.push("/dashboard/vendors")}
                disabled={isFixing}
              >
                Skip for Now
              </Button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p><strong>Note:</strong> This operation is safe and will preserve all existing data.</p>
              <p>If you encounter any issues, you can always run this fix again.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

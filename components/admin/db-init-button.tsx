"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Database, RefreshCw } from "lucide-react"

export function DbInitButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const initializeDatabase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/init-db-direct")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize database")
      }

      toast({
        title: "Database Initialized",
        description: data.message || "Database has been successfully initialized",
      })
    } catch (error) {
      console.error("Database initialization error:", error)
      toast({
        title: "Initialization Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={initializeDatabase}
      disabled={isLoading}
      variant="outline"
      className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
    >
      {isLoading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Initializing...
        </>
      ) : (
        <>
          <Database className="mr-2 h-4 w-4" />
          Initialize Database
        </>
      )}
    </Button>
  )
}

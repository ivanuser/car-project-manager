"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function DbInitButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleInitDb = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/init-db-direct")
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize database")
      }

      toast({
        title: "Database Initialized",
        description: data.message || "Database tables created successfully",
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
      onClick={handleInitDb}
      disabled={isLoading}
      variant="outline"
      className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300"
    >
      {isLoading ? "Initializing..." : "Initialize Database"}
    </Button>
  )
}

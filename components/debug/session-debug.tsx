"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SessionDebug() {
  const [session, setSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function getSession() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          setError(error.message)
        } else {
          setSession(data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setIsLoading(false)
      }
    }

    getSession()
  }, [supabase])

  if (process.env.NODE_ENV !== "development") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button variant="outline" size="sm" onClick={() => setIsVisible(!isVisible)} className="mb-2">
        {isVisible ? "Hide" : "Show"} Session Debug
      </Button>

      {isVisible && (
        <Card className="w-96 max-h-96 overflow-auto">
          <CardHeader>
            <CardTitle>Session Debug</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Loading session...</p>
            ) : error ? (
              <p className="text-red-500">Error: {error}</p>
            ) : (
              <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(session, null, 2)}</pre>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

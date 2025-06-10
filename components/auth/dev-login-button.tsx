"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export function DevLoginButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Disable dev login in this build to force real user authentication
  const isDisabled = true;

  const handleDevLogin = async () => {
    setIsLoading(true)
    try {
      if (isDisabled) {
        toast({
          title: "Dev Login Disabled",
          description: "Dev login has been disabled. Please use your real Supabase account.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      const response = await fetch("/api/auth/dev-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to login")
      }

      toast({
        title: "Development Login Successful",
        description: `Logged in as ${data.user.email}`,
      })

      // Redirect to dashboard
      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Dev login error:", error)
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleDevLogin}
      disabled={isLoading || isDisabled}
      variant="outline"
      className="mt-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-300 opacity-50"
      title="Dev login is disabled"
    >
      {isLoading ? "Logging in..." : "Dev Login (Disabled)"}
    </Button>
  )
}

"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function DirectLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const { toast } = useToast()

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onLoginSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setDebugInfo("Starting direct login process...")

    try {
      // Add more detailed debugging
      setDebugInfo("Preparing to send login request to API...")
      
      const requestPayload = {
        email: data.email,
        password: data.password,
      }
      
      setDebugInfo(`Sending login request for: ${data.email}`)
      
      // Call our direct login API endpoint
      const response = await fetch("/api/auth/direct-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestPayload),
        // Add these options to ensure credentials are sent properly
        credentials: "include"
      })
      
      setDebugInfo(`Received status ${response.status} ${response.statusText}`)
      
      let result
      try {
        result = await response.json()
        setDebugInfo(`Parsed response: ${JSON.stringify(result)}`)
      } catch (parseError) {
        setDebugInfo(`Error parsing response: ${parseError instanceof Error ? parseError.message : String(parseError)}`)
        throw new Error("Failed to parse login response")
      }

      if (!response.ok) {
        setDebugInfo(`Login failed: ${result.error || 'Unknown error'}`)
        throw new Error(result.error || "Login failed")
      }

      setDebugInfo(`Login successful for ${data.email}. Session created.`)
      
      toast({
        title: "Success",
        description: "You have been logged in successfully",
      })

      // Check for authentication by making a simple authenticated request
      setDebugInfo("Verifying authentication status...")
      try {
        const authCheck = await fetch("/api/auth/check", {
          credentials: "include"
        })
        const authResult = await authCheck.json()
        setDebugInfo(`Auth check result: ${JSON.stringify(authResult)}`)
      } catch (checkError) {
        setDebugInfo(`Auth check error: ${checkError instanceof Error ? checkError.message : String(checkError)}`)
      }

      // Force a hard navigation to the dashboard
      setDebugInfo("Redirecting to dashboard in 2 seconds...")
      
      // Add a small delay to ensure the toast is visible
      setTimeout(() => {
        setDebugInfo("Executing redirect now...")
        // Use window.location for a full page reload to ensure cookies are properly set
        window.location.href = "/dashboard"
      }, 2000)
    } catch (error) {
      console.error("Login error:", error)
      setDebugInfo(`Login error: ${error instanceof Error ? error.message : String(error)}`)
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
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">CAJPRO Direct Login</h1>
          <p className="text-gray-600 mt-2">Use this form to fix authentication issues</p>
        </div>
        
        <Card className="w-full max-w-md glass-card">
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            <CardContent className="space-y-4 pt-6">
              <CardTitle className="text-2xl text-center mb-2">Direct Login</CardTitle>
              <CardDescription className="text-center mb-4">
                This form uses a server-side authentication approach
              </CardDescription>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...loginForm.register("email")}
                  className={cn(loginForm.formState.errors.email && "border-error")}
                />
                {loginForm.formState.errors.email && (
                  <p className="text-sm text-error">{loginForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...loginForm.register("password")}
                    className={cn(loginForm.formState.errors.password && "border-error")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-error">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              {debugInfo && (
                <Alert variant="outline" className="bg-yellow-50 dark:bg-yellow-900/30 text-xs">
                  <AlertDescription className="font-mono break-all whitespace-pre-wrap">{debugInfo}</AlertDescription>
                </Alert>
              )}
              
              <div className="text-xs text-center text-muted-foreground">
                <p>
                  Need help? Visit the <a href="/api/auth/debug" target="_blank" className="underline hover:text-primary">Auth Debug</a> page
                </p>
                <p className="mt-1">
                  Issues with sign in? Try <a href="/api/auth/reset" className="underline hover:text-primary">Reset Auth</a>
                </p>
              </div>
              
              {/* Add this additional debugging section */}
              <div className="text-xs text-center text-muted-foreground mt-4">
                <button
                  type="button"
                  className="text-blue-500 hover:underline"
                  onClick={async () => {
                    try {
                      setDebugInfo("Checking auth status...")
                      const response = await fetch("/api/auth/check", {
                        credentials: "include"
                      })
                      const result = await response.json()
                      setDebugInfo("Auth status: " + JSON.stringify(result, null, 2))
                    } catch (error) {
                      setDebugInfo("Auth check error: " + (error instanceof Error ? error.message : String(error)))
                    }
                  }}
                >
                  Check Auth Status
                </button>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-red-600 to-purple-600 hover:from-red-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Direct Sign In"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-6 text-center">
          <a href="/login" className="text-sm text-blue-500 hover:underline">
            Return to standard login
          </a>
        </div>
      </div>
    </div>
  )
}

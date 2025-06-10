"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createAuthClient } from "@/lib/client-auth"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface ClientAuthFormProps {
  defaultTab?: "login" | "register"
}

export function ClientAuthForm({ defaultTab = "login" }: ClientAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Check if Supabase is configured
  const isMissingConfig =
    typeof window !== "undefined" &&
    (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onLoginSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setDebugInfo("Starting login process...")

    try {
      if (isMissingConfig) {
        toast({
          title: "Configuration Error",
          description: "Authentication is not available in preview mode",
          variant: "destructive",
        })
        return
      }

      setDebugInfo("Creating auth client...")
      const supabase = createAuthClient()
      
      setDebugInfo("Attempting login with email and password...")
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        console.error("Login error:", error)
        setDebugInfo(`Login error: ${error.message}`)
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive",
        })
        return
      }

      setDebugInfo(`Login successful for ${data.email}`)
      
      // Check if session is set
      const { data: sessionData } = await supabase.auth.getSession()
      
      // Enhanced logging
      console.log("AUTH DEBUG - Login successful:", {
        user: authData.user.email,
        userId: authData.user.id,
        sessionExists: !!sessionData.session,
        sessionId: sessionData.session?.id,
        expiresAt: sessionData.session ? new Date(sessionData.session.expires_at * 1000).toLocaleString() : null
      })
      
      setDebugInfo(`Session check: ${sessionData.session ? "Session exists" : "No session"}`)
      
      // Store session in localStorage as a backup
      if (typeof window !== 'undefined' && sessionData.session) {
        localStorage.setItem('supabase-auth-user-email', authData.user.email || '')
        localStorage.setItem('supabase-auth-user-id', authData.user.id || '')
      }
      
      toast({
        title: "Success",
        description: "You have been logged in successfully",
      })

      // Create or update user profile
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', authData.user.id)
          .single()
          
        if (!profile) {
          // Create a profile
          setDebugInfo("Creating user profile...")
          await supabase.from('profiles').insert({
            id: authData.user.id,
            full_name: data.email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      } catch (err) {
        // Profile operations might fail due to RLS, but we still want to continue
        console.log("Profile operation failed, continuing anyway:", err)
      }

      // Force a hard navigation to the dashboard
      setDebugInfo("Redirecting to dashboard...")
      
      // Add a small delay to ensure the toast is visible and session is set
      setTimeout(() => {
        // Use window.location for a full page reload to ensure cookies are properly set
        window.location.href = "/dashboard"
        
        // Additional debugging
        console.log("AUTH DEBUG: Redirecting to dashboard after successful login", {
          user: authData.user,
          sessionExists: !!sessionData.session
        })
      }, 1500)
    } catch (error) {
      console.error("Login error:", error)
      setDebugInfo(`Login error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: "An unexpected error occurred during login. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md glass-card">
      <Tabs defaultValue="login" className="w-full">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Client Login</TabsTrigger>
            <TabsTrigger value="register" disabled>Register</TabsTrigger>
          </TabsList>
        </CardHeader>

        <TabsContent value="login">
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            <CardContent className="space-y-4">
              <CardTitle className="text-2xl text-center mb-2">Client-Side Login</CardTitle>
              <CardDescription className="text-center mb-4">
                Enter your email and password to sign in
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
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
                  <AlertDescription className="font-mono break-all">{debugInfo}</AlertDescription>
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
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                disabled={isLoading || isMissingConfig}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

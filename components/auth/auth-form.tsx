"use client"

import { useState, useEffect } from "react"
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
import { signIn, signUp } from "@/actions/auth-actions"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

const registerSchema = z
  .object({
    name: z.string().min(2, { message: "Name must be at least 2 characters" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

interface AuthFormProps {
  defaultTab?: "login" | "register"
}

export function AuthForm({ defaultTab = "login" }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onLoginSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setDebugInfo(null)

    try {
      if (isMissingConfig) {
        toast({
          title: "Configuration Error",
          description: "Authentication is not available in preview mode",
          variant: "destructive",
        })
        return
      }

      const formData = new FormData()
      formData.append("email", data.email)
      formData.append("password", data.password)

      setDebugInfo("Submitting login form...")
      const result = await signIn(formData)
      setDebugInfo(`Login result: ${JSON.stringify(result)}`)

      if (result.error) {
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success) {
        toast({
          title: "Success",
          description: "You have been logged in successfully",
        })

        // Force a hard navigation to the dashboard
        setDebugInfo("Redirecting to dashboard...")

        // Add a small delay to ensure the toast is visible
        setTimeout(() => {
          if (result.shouldRedirect) {
            // Use window.location for a full page reload
            window.location.href = "/dashboard"
          } else {
            router.push("/dashboard")
            router.refresh()
          }
        }, 500)
      }
    } catch (error) {
      console.error("Login error:", error)
      setDebugInfo(`Login error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onRegisterSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    setDebugInfo(null)

    try {
      if (isMissingConfig) {
        toast({
          title: "Configuration Error",
          description: "Registration is not available in preview mode",
          variant: "destructive",
        })
        return
      }

      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("email", data.email)
      formData.append("password", data.password)

      setDebugInfo("Submitting registration form...")
      const result = await signUp(formData)
      setDebugInfo(`Registration result: ${JSON.stringify(result)}`)

      if (result.error) {
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive",
        })
      } else if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Your account has been created",
        })
        // Stay on the same page for email verification
      }
    } catch (error) {
      console.error("Register error:", error)
      setDebugInfo(`Registration error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session")
        const data = await response.json()
        if (data.session) {
          setDebugInfo(`Session found: ${JSON.stringify(data.session)}`)
        } else {
          setDebugInfo("No session found")
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }

    checkSession()
  }, [])

  return (
    <Card className="w-full max-w-md glass-card">
      <Tabs defaultValue={defaultTab} className="w-full">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
        </CardHeader>

        <TabsContent value="login">
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            <CardContent className="space-y-4">
              <CardTitle className="text-2xl text-center mb-2">Welcome Back</CardTitle>
              <CardDescription className="text-center mb-4">
                Enter your credentials to access your account
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
                  <Button variant="link" size="sm" className="px-0 text-xs text-accent">
                    Forgot password?
                  </Button>
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
                <Alert variant="outline" className="bg-muted/50 text-xs">
                  <AlertDescription className="font-mono break-all">{debugInfo}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark"
                disabled={isLoading || isMissingConfig}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>

        <TabsContent value="register">
          {/* Register form content remains the same */}
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
            <CardContent className="space-y-4">
              <CardTitle className="text-2xl text-center mb-2">Create Account</CardTitle>
              <CardDescription className="text-center mb-4">Enter your details to create a new account</CardDescription>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  {...registerForm.register("name")}
                  className={cn(registerForm.formState.errors.name && "border-error")}
                />
                {registerForm.formState.errors.name && (
                  <p className="text-sm text-error">{registerForm.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">Email</Label>
                <Input
                  id="register-email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...registerForm.register("email")}
                  className={cn(registerForm.formState.errors.email && "border-error")}
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-error">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Password</Label>
                <div className="relative">
                  <Input
                    id="register-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...registerForm.register("password")}
                    className={cn(registerForm.formState.errors.password && "border-error")}
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
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-error">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...registerForm.register("confirmPassword")}
                    className={cn(registerForm.formState.errors.confirmPassword && "border-error")}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                  </Button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-error">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {debugInfo && (
                <Alert variant="outline" className="bg-muted/50 text-xs">
                  <AlertDescription className="font-mono break-all">{debugInfo}</AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark"
                disabled={isLoading || isMissingConfig}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </CardFooter>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

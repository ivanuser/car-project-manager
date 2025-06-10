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

// Import auth hook that uses our PostgreSQL auth
import { useAuth } from "@/hooks/auth/useAuth"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(8, { message: "Password must be at least 8 characters" }),
  confirmPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

interface PgAuthFormProps {
  defaultTab?: "login" | "register"
}

export function PgAuthForm({ defaultTab = "login" }: PgAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  
  // Use our custom PostgreSQL auth hook
  const { login, register: registerUser, error: authError } = useAuth()

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
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  async function onLoginSubmit(data: LoginFormValues) {
    setIsLoading(true)
    setDebugInfo("Starting login process...")

    try {
      setDebugInfo(`Attempting login for: ${data.email}`)
      
      // Use our PostgreSQL auth login
      await login(data.email, data.password)
      
      setDebugInfo(`Login successful for ${data.email}`)
      
      toast({
        title: "Success",
        description: "You have been logged in successfully",
      })

      // Redirect to dashboard
      setDebugInfo("Redirecting to dashboard...")
      
      // Add a small delay to ensure the toast is visible
      setTimeout(() => {
        // Use window.location for a full page reload to ensure cookies are properly set
        window.location.href = "/dashboard"
      }, 1500)
    } catch (error) {
      console.error("Login error:", error)
      setDebugInfo(`Login error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred during login",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function onRegisterSubmit(data: RegisterFormValues) {
    setIsLoading(true)
    setDebugInfo("Starting registration process...")

    try {
      setDebugInfo(`Attempting registration for: ${data.email}`)
      
      // Use our PostgreSQL auth registration
      await registerUser(data.email, data.password, data.confirmPassword)
      
      setDebugInfo(`Registration successful for ${data.email}`)
      
      toast({
        title: "Success",
        description: "Your account has been created successfully",
      })

      // Redirect to dashboard
      setDebugInfo("Redirecting to dashboard...")
      
      // Add a small delay to ensure the toast is visible
      setTimeout(() => {
        // Use window.location for a full page reload to ensure cookies are properly set
        window.location.href = "/dashboard"
      }, 1500)
    } catch (error) {
      console.error("Registration error:", error)
      setDebugInfo(`Registration error: ${error instanceof Error ? error.message : String(error)}`)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred during registration",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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
              <CardTitle className="text-2xl text-center mb-2">PostgreSQL Auth</CardTitle>
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

              {(debugInfo || authError) && (
                <Alert variant="outline" className="bg-yellow-50 dark:bg-yellow-900/30 text-xs">
                  <AlertDescription className="font-mono break-all">
                    {authError && <div className="text-red-600">{authError}</div>}
                    {debugInfo && <div>{debugInfo}</div>}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                disabled={isLoading}
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

        <TabsContent value="register">
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
            <CardContent className="space-y-4">
              <CardTitle className="text-2xl text-center mb-2">Create Account</CardTitle>
              <CardDescription className="text-center mb-4">
                Enter your details to create a new account
              </CardDescription>

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
                <Label htmlFor="register-confirm-password">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="register-confirm-password"
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
                    <span className="sr-only">
                      {showConfirmPassword ? "Hide password" : "Show password"}
                    </span>
                  </Button>
                </div>
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-error">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {(debugInfo || authError) && (
                <Alert variant="outline" className="bg-yellow-50 dark:bg-yellow-900/30 text-xs">
                  <AlertDescription className="font-mono break-all">
                    {authError && <div className="text-red-600">{authError}</div>}
                    {debugInfo && <div>{debugInfo}</div>}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                disabled={isLoading}
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

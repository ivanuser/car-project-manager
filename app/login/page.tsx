"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GradientBackground } from "@/components/gradient-background"
import { CajproLogo } from "@/components/cajpro-logo"
import { Particles } from "@/components/particles"

// Import auth hook that uses our PostgreSQL auth
import { useAuth } from "@/hooks/auth/useAuth"

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterFormValues = z.infer<typeof registerSchema>

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [sessionStatus, setSessionStatus] = useState<string | null>("No session found")
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
    setSessionStatus("Logging in...")

    try {
      await login(data.email, data.password)
      
      setSessionStatus("Login successful, redirecting...")
      
      toast({
        title: "Success",
        description: "You have been logged in successfully",
      })

      // Redirect to dashboard
      setTimeout(() => {
        // Use window.location for a full page reload to ensure cookies are properly set
        window.location.href = "/dashboard"
      }, 1500)
    } catch (error) {
      console.error("Login error:", error)
      setSessionStatus("Login failed: " + (error instanceof Error ? error.message : String(error)))
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
    setSessionStatus("Creating account...")

    try {
      await registerUser(data.email, data.password, data.confirmPassword)
      
      setSessionStatus("Registration successful, redirecting...")
      
      toast({
        title: "Success",
        description: "Your account has been created successfully",
      })

      // Redirect to dashboard
      setTimeout(() => {
        // Use window.location for a full page reload to ensure cookies are properly set
        window.location.href = "/dashboard"
      }, 1500)
    } catch (error) {
      console.error("Registration error:", error)
      setSessionStatus("Registration failed: " + (error instanceof Error ? error.message : String(error)))
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
    <div className="flex min-h-screen flex-col items-center justify-center">
      {/* Background elements */}
      <GradientBackground intensity="strong" />
      <Particles quantity={50} speed={0.5} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <Link href="/" className="mb-6">
            <CajproLogo size="lg" />
          </Link>
          
          <h1 className="text-4xl font-bold text-white mb-2">Vehicle Project</h1>
          <h1 className="text-4xl font-bold text-white mb-4">Management</h1>
          <p className="text-gray-200 max-w-md">
            Track, manage, and optimize your vehicle builds with CAJPRO
          </p>
        </div>

        <div className="max-w-md w-full mx-auto">
          <Card className="w-full bg-background/90 backdrop-blur-md border-border/50 shadow-lg">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
                  <CardDescription className="text-center">
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>

                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        {...loginForm.register("email")}
                        className={cn(loginForm.formState.errors.email && "border-destructive")}
                      />
                      {loginForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...loginForm.register("password")}
                          className={cn(loginForm.formState.errors.password && "border-destructive")}
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
                        <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>

                    {sessionStatus && (
                      <div className="bg-secondary/10 border border-secondary/20 rounded p-2 text-center text-sm text-secondary-foreground">
                        {sessionStatus}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">Create Account</CardTitle>
                  <CardDescription className="text-center">
                    Enter your details to create a new account
                  </CardDescription>
                </CardHeader>

                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your.email@example.com"
                        {...registerForm.register("email")}
                        className={cn(registerForm.formState.errors.email && "border-destructive")}
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
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
                          className={cn(registerForm.formState.errors.password && "border-destructive")}
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
                        <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
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
                          className={cn(registerForm.formState.errors.confirmPassword && "border-destructive")}
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
                        <p className="text-sm text-destructive">
                          {registerForm.formState.errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {sessionStatus && (
                      <div className="bg-secondary/10 border border-secondary/20 rounded p-2 text-center text-sm text-secondary-foreground">
                        {sessionStatus}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>

          {/* Development credentials display */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-8 text-center text-sm text-gray-400 bg-black/50 p-4 rounded-md">
              <p className="font-semibold mb-1">Development credentials:</p>
              <p>Email: admin@cajpro.local</p>
              <p>Password: admin123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

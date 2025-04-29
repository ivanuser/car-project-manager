import { Logo } from "@/components/logo"
import { AuthForm } from "@/components/auth/auth-form"
import { AnimatedBackground } from "@/components/animated-background"
import { Toaster } from "@/components/ui/toaster"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface LoginPageProps {
  searchParams?: {
    error?: string
    tab?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const error = searchParams?.error
  const tab = searchParams?.tab || "login"

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 relative overflow-hidden">
      <AnimatedBackground particleCount={75} connectionDistance={150} />

      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background/80 backdrop-blur-sm z-0" />

      <div className="absolute top-4 left-4 z-10">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <Logo size="lg" />

        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold gradient-text mb-2">Vehicle Project Management</h1>
          <p className="text-muted-foreground">Track, manage, and optimize your vehicle builds with CAJPRO</p>
        </div>

        {error === "auth" && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Error</AlertTitle>
            <AlertDescription>
              There was an issue with the authentication service. Please try again later or contact support.
            </AlertDescription>
          </Alert>
        )}

        <AuthForm defaultTab={tab as "login" | "register"} />
      </div>

      <Toaster />
    </main>
  )
}

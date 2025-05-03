import { AuthForm } from "@/components/auth/auth-form"
import { DevLoginButton } from "@/components/auth/dev-login-button"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Welcome to CAJPRO</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>

        <AuthForm />

        {/* Only show in development */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 text-center">
            <DevLoginButton />
          </div>
        )}
      </div>
    </div>
  )
}

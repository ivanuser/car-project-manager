import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DemoHeader } from "@/components/demo/demo-header"
import { DemoSidebar } from "@/components/demo/demo-sidebar"
import { DemoContent } from "@/components/demo/demo-content"

export const metadata = {
  title: "CAJPRO - Interactive Demo",
  description: "Experience the CAJPRO platform with our interactive demo",
}

export default function DemoPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="bg-primary/10 p-2 text-center">
        <p className="text-sm">
          This is a demo version.{" "}
          <Link href="/login?tab=register" className="font-medium underline">
            Sign up
          </Link>{" "}
          for the full experience.
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <DemoSidebar />

        <div className="flex flex-col flex-1 overflow-hidden">
          <DemoHeader />
          <DemoContent />
        </div>
      </div>

      <div className="fixed bottom-4 right-4 z-50">
        <Button
          size="lg"
          className="bg-gradient-to-r from-primary-dark via-secondary to-accent hover:from-primary hover:to-accent-dark shadow-lg"
          asChild
        >
          <Link href="/login?tab=register">Sign Up Now</Link>
        </Button>
      </div>
    </div>
  )
}

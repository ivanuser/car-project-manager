import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { initializeDatabase } from "@/lib/db-init"
import AuthProvider from "@/hooks/auth/AuthProvider"
import { ColorThemeInitializer } from "@/components/color-theme-initializer"

// Initialize database on server
initializeDatabase().catch((error) => {
  console.error('Failed to initialize database:', error);
});

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: "CAJPRO - Vehicle Project Management",
  description: "Track and manage your vehicle projects with CAJPRO",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ColorThemeInitializer />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

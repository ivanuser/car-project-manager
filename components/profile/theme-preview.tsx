"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ThemePreviewProps {
  theme: string
  colorScheme: string
  onThemeChange?: (theme: string) => void
  onColorSchemeChange?: (colorScheme: string) => void
}

const colorSchemes = {
  default: {
    primary: "hsl(222.2 47.4% 11.2%)",
    primaryForeground: "hsl(210 40% 98%)",
    accent: "hsl(210 40% 96.1%)",
    border: "hsl(214.3 31.8% 91.4%)",
    darkPrimary: "hsl(210 40% 98%)",
    darkPrimaryForeground: "hsl(222.2 47.4% 11.2%)",
    darkAccent: "hsl(217.2 32.6% 17.5%)",
    darkBorder: "hsl(217.2 32.6% 17.5%)",
  },
  blue: {
    primary: "hsl(221.2 83.2% 53.3%)",
    primaryForeground: "hsl(210 40% 98%)",
    accent: "hsl(214.3 95.1% 93.9%)",
    border: "hsl(214.3 31.8% 91.4%)",
    darkPrimary: "hsl(217.2 91.2% 59.8%)",
    darkPrimaryForeground: "hsl(222.2 47.4% 11.2%)",
    darkAccent: "hsl(217.2 32.6% 17.5%)",
    darkBorder: "hsl(217.2 32.6% 17.5%)",
  },
  green: {
    primary: "hsl(142.1 76.2% 36.3%)",
    primaryForeground: "hsl(355.7 100% 97.3%)",
    accent: "hsl(138.5 76.5% 96.7%)",
    border: "hsl(214.3 31.8% 91.4%)",
    darkPrimary: "hsl(142.1 70.6% 45.3%)",
    darkPrimaryForeground: "hsl(144.9 80.4% 10%)",
    darkAccent: "hsl(144.9 80.4% 10%)",
    darkBorder: "hsl(217.2 32.6% 17.5%)",
  },
  purple: {
    primary: "hsl(262.1 83.3% 57.8%)",
    primaryForeground: "hsl(210 40% 98%)",
    accent: "hsl(259.8 95.1% 93.9%)",
    border: "hsl(214.3 31.8% 91.4%)",
    darkPrimary: "hsl(263.4 70% 50.4%)",
    darkPrimaryForeground: "hsl(210 40% 98%)",
    darkAccent: "hsl(217.2 32.6% 17.5%)",
    darkBorder: "hsl(217.2 32.6% 17.5%)",
  },
  orange: {
    primary: "hsl(24.6 95% 53.1%)",
    primaryForeground: "hsl(60 9.1% 97.8%)",
    accent: "hsl(20.5 90.2% 48.2%)",
    border: "hsl(214.3 31.8% 91.4%)",
    darkPrimary: "hsl(20.5 90.2% 48.2%)",
    darkPrimaryForeground: "hsl(60 9.1% 97.8%)",
    darkAccent: "hsl(217.2 32.6% 17.5%)",
    darkBorder: "hsl(217.2 32.6% 17.5%)",
  },
}

export function ThemePreview({ theme, colorScheme, onThemeChange, onColorSchemeChange }: ThemePreviewProps) {
  const [mounted, setMounted] = useState(false)
  const [previewTheme, setPreviewTheme] = useState(theme)
  const [previewColorScheme, setPreviewColorScheme] = useState(colorScheme)
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  // Only show the preview after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Update preview theme when prop changes
  useEffect(() => {
    setPreviewTheme(theme)
  }, [theme])

  // Update preview color scheme when prop changes
  useEffect(() => {
    setPreviewColorScheme(colorScheme)
  }, [colorScheme])

  const handleThemeChange = (newTheme: string) => {
    setPreviewTheme(newTheme)
    if (onThemeChange) {
      onThemeChange(newTheme)
    }
  }

  const handleColorSchemeChange = (newColorScheme: string) => {
    setPreviewColorScheme(newColorScheme)
    if (onColorSchemeChange) {
      onColorSchemeChange(newColorScheme)
    }
  }

  if (!mounted) {
    return null
  }

  const isDark =
    previewTheme === "dark" || (previewTheme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
  const colors = colorSchemes[previewColorScheme as keyof typeof colorSchemes] || colorSchemes.default

  // Apply the selected color scheme to the preview
  const previewStyle = {
    "--preview-primary": isDark ? colors.darkPrimary : colors.primary,
    "--preview-primary-foreground": isDark ? colors.darkPrimaryForeground : colors.primaryForeground,
    "--preview-accent": isDark ? colors.darkAccent : colors.accent,
    "--preview-border": isDark ? colors.darkBorder : colors.border,
    "--preview-background": isDark ? "hsl(224 71% 4%)" : "white",
    "--preview-foreground": isDark ? "hsl(213 31% 91%)" : "hsl(222.2 47.4% 11.2%)",
    "--preview-muted": isDark ? "hsl(223 47% 11%)" : "hsl(210 40% 96.1%)",
    "--preview-muted-foreground": isDark ? "hsl(215.4 16.3% 56.9%)" : "hsl(215.4 16.3% 46.9%)",
  } as React.CSSProperties

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <Label>Theme</Label>
          <div className="flex gap-2">
            <Button
              variant={previewTheme === "light" ? "default" : "outline"}
              size="sm"
              onClick={() => handleThemeChange("light")}
            >
              Light
            </Button>
            <Button
              variant={previewTheme === "dark" ? "default" : "outline"}
              size="sm"
              onClick={() => handleThemeChange("dark")}
            >
              Dark
            </Button>
            <Button
              variant={previewTheme === "system" ? "default" : "outline"}
              size="sm"
              onClick={() => handleThemeChange("system")}
            >
              System
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Color Scheme</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={previewColorScheme === "default" ? "default" : "outline"}
              size="sm"
              onClick={() => handleColorSchemeChange("default")}
            >
              Default
            </Button>
            <Button
              variant={previewColorScheme === "blue" ? "default" : "outline"}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => handleColorSchemeChange("blue")}
            >
              Blue
            </Button>
            <Button
              variant={previewColorScheme === "green" ? "default" : "outline"}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => handleColorSchemeChange("green")}
            >
              Green
            </Button>
            <Button
              variant={previewColorScheme === "purple" ? "default" : "outline"}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => handleColorSchemeChange("purple")}
            >
              Purple
            </Button>
            <Button
              variant={previewColorScheme === "orange" ? "default" : "outline"}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white"
              onClick={() => handleColorSchemeChange("orange")}
            >
              Orange
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-lg border shadow-sm overflow-hidden" style={previewStyle}>
        <div
          className="p-6 space-y-6"
          style={{
            backgroundColor: "var(--preview-background)",
            color: "var(--preview-foreground)",
          }}
        >
          <div className="space-y-1">
            <h3 className="text-2xl font-bold tracking-tight" style={{ color: "var(--preview-foreground)" }}>
              Theme Preview
            </h3>
            <p className="text-sm" style={{ color: "var(--preview-muted-foreground)" }}>
              See how your selected theme and colors will look.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card
              style={{
                backgroundColor: "var(--preview-background)",
                borderColor: "var(--preview-border)",
                color: "var(--preview-foreground)",
              }}
            >
              <CardHeader>
                <CardTitle style={{ color: "var(--preview-foreground)" }}>Project Card</CardTitle>
                <CardDescription style={{ color: "var(--preview-muted-foreground)" }}>
                  Example project information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--preview-muted-foreground)" }}>Status</span>
                    <Badge
                      style={{
                        backgroundColor: "var(--preview-primary)",
                        color: "var(--preview-primary-foreground)",
                      }}
                    >
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span style={{ color: "var(--preview-muted-foreground)" }}>Progress</span>
                    <span>75%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: "var(--preview-muted)" }}>
                    <div
                      className="h-full w-3/4 rounded-full"
                      style={{ backgroundColor: "var(--preview-primary)" }}
                    ></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  style={{
                    backgroundColor: "var(--preview-primary)",
                    color: "var(--preview-primary-foreground)",
                  }}
                >
                  View Details
                </Button>
              </CardFooter>
            </Card>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preview-name" style={{ color: "var(--preview-foreground)" }}>
                  Name
                </Label>
                <Input
                  id="preview-name"
                  placeholder="Enter your name"
                  style={{
                    backgroundColor: "var(--preview-background)",
                    borderColor: "var(--preview-border)",
                    color: "var(--preview-foreground)",
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="preview-select" style={{ color: "var(--preview-foreground)" }}>
                  Category
                </Label>
                <Select>
                  <SelectTrigger
                    id="preview-select"
                    style={{
                      backgroundColor: "var(--preview-background)",
                      borderColor: "var(--preview-border)",
                      color: "var(--preview-foreground)",
                    }}
                  >
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="restoration">Restoration</SelectItem>
                    <SelectItem value="modification">Modification</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="preview-switch" />
                <Label htmlFor="preview-switch" style={{ color: "var(--preview-foreground)" }}>
                  Receive notifications
                </Label>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  style={{
                    backgroundColor: "transparent",
                    borderColor: "var(--preview-border)",
                    color: "var(--preview-foreground)",
                  }}
                >
                  Cancel
                </Button>
                <Button
                  style={{
                    backgroundColor: "var(--preview-primary)",
                    color: "var(--preview-primary-foreground)",
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="overview">
            <TabsList
              className="grid w-full grid-cols-3"
              style={{
                backgroundColor: "var(--preview-muted)",
                color: "var(--preview-muted-foreground)",
              }}
            >
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-2">
              <div className="rounded-md p-4" style={{ backgroundColor: "var(--preview-accent)" }}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full" style={{ backgroundColor: "var(--preview-muted)" }}></div>
                  <div>
                    <h4 className="text-sm font-medium" style={{ color: "var(--preview-foreground)" }}>
                      Project Overview
                    </h4>
                    <p className="text-xs" style={{ color: "var(--preview-muted-foreground)" }}>
                      View your project statistics and progress
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="mt-2">
              <div className="rounded-md p-4" style={{ backgroundColor: "var(--preview-accent)" }}>
                Analytics content
              </div>
            </TabsContent>
            <TabsContent value="reports" className="mt-2">
              <div className="rounded-md p-4" style={{ backgroundColor: "var(--preview-accent)" }}>
                Reports content
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

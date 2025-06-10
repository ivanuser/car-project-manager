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
import { Slider } from "@/components/ui/slider"
import { Clock, Settings, Wrench, ImageIcon } from "lucide-react"
import { Progress } from "@/components/ui/progress"

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
  red: {
    primary: "hsl(0 72.2% 50.6%)",
    primaryForeground: "hsl(60 9.1% 97.8%)",
    accent: "hsl(0 85.7% 97.3%)",
    border: "hsl(214.3 31.8% 91.4%)",
    darkPrimary: "hsl(0 72.2% 50.6%)",
    darkPrimaryForeground: "hsl(60 9.1% 97.8%)",
    darkAccent: "hsl(0 0% 15%)",
    darkBorder: "hsl(217.2 32.6% 17.5%)",
  },
  teal: {
    primary: "hsl(173 80% 40%)",
    primaryForeground: "hsl(60 9.1% 97.8%)",
    accent: "hsl(173 80% 95%)",
    border: "hsl(214.3 31.8% 91.4%)",
    darkPrimary: "hsl(173 80% 40%)",
    darkPrimaryForeground: "hsl(60 9.1% 97.8%)",
    darkAccent: "hsl(173 30% 15%)",
    darkBorder: "hsl(217.2 32.6% 17.5%)",
  },
  amber: {
    primary: "hsl(38 92% 50%)",
    primaryForeground: "hsl(60 9.1% 97.8%)",
    accent: "hsl(38 92% 95%)",
    border: "hsl(214.3 31.8% 91.4%)",
    darkPrimary: "hsl(38 92% 50%)",
    darkPrimaryForeground: "hsl(60 9.1% 97.8%)",
    darkAccent: "hsl(38 30% 15%)",
    darkBorder: "hsl(217.2 32.6% 17.5%)",
  },
  pink: {
    primary: "hsl(330 81% 60%)",
    primaryForeground: "hsl(60 9.1% 97.8%)",
    accent: "hsl(330 81% 95%)",
    border: "hsl(214.3 31.8% 91.4%)",
    darkPrimary: "hsl(330 81% 60%)",
    darkPrimaryForeground: "hsl(60 9.1% 97.8%)",
    darkAccent: "hsl(330 30% 15%)",
    darkBorder: "hsl(217.2 32.6% 17.5%)",
  },
}

export function DemoThemeShowcase() {
  const [theme, setTheme] = useState("light")
  const [colorScheme, setColorScheme] = useState("default")
  const [backgroundIntensity, setBackgroundIntensity] = useState(50)
  const [uiDensity, setUiDensity] = useState("comfortable")
  const [previewSection, setPreviewSection] = useState("dashboard")
  const [mounted, setMounted] = useState(false)

  // Only show the preview after mounting to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const isDark = theme === "dark"
  const colors = colorSchemes[colorScheme as keyof typeof colorSchemes] || colorSchemes.default

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

  // Apply UI density
  const densityStyles = {
    compact: {
      padding: "0.5rem",
      gap: "0.5rem",
      fontSize: "0.875rem",
    },
    comfortable: {
      padding: "1rem",
      gap: "1rem",
      fontSize: "1rem",
    },
    spacious: {
      padding: "1.5rem",
      gap: "1.5rem",
      fontSize: "1rem",
    },
  }

  const selectedDensity = densityStyles[uiDensity as keyof typeof densityStyles] || densityStyles.comfortable

  return (
    <div className="space-y-6">
      <div className="space-y-2 mb-6">
        <h3 className="text-xl font-semibold">Theme Customization</h3>
        <p className="text-muted-foreground">
          Personalize your CAJPRO experience with different themes and color schemes
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme Mode</Label>
            <div className="flex gap-2">
              <Button variant={theme === "light" ? "default" : "outline"} size="sm" onClick={() => setTheme("light")}>
                Light
              </Button>
              <Button variant={theme === "dark" ? "default" : "outline"} size="sm" onClick={() => setTheme("dark")}>
                Dark
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color Scheme</Label>
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(colorSchemes).map((scheme) => (
                <Button
                  key={scheme}
                  variant={colorScheme === scheme ? "default" : "outline"}
                  size="sm"
                  className={
                    colorScheme !== scheme && scheme !== "default"
                      ? `bg-${scheme}-600 hover:bg-${scheme}-700 text-white`
                      : ""
                  }
                  onClick={() => setColorScheme(scheme)}
                >
                  {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Background Intensity: {backgroundIntensity}%</Label>
            <Slider
              value={[backgroundIntensity]}
              min={0}
              max={100}
              step={10}
              onValueChange={(value) => setBackgroundIntensity(value[0])}
            />
          </div>

          <div className="space-y-2">
            <Label>UI Density</Label>
            <Select value={uiDensity} onValueChange={setUiDensity}>
              <SelectTrigger>
                <SelectValue placeholder="Select UI density" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Preview Section</Label>
            <Select value={previewSection} onValueChange={setPreviewSection}>
              <SelectTrigger>
                <SelectValue placeholder="Select preview section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dashboard">Dashboard</SelectItem>
                <SelectItem value="project">Project Details</SelectItem>
                <SelectItem value="form">Form Elements</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-sm text-muted-foreground">
            See how your selected theme will look across different sections of the application. Changes here are just
            for preview.
          </div>
        </div>
      </div>

      <div
        className="rounded-lg border shadow-sm overflow-hidden"
        style={{
          ...previewStyle,
          backgroundImage: isDark
            ? `linear-gradient(to bottom right, rgba(30, 41, 59, ${backgroundIntensity / 100}), rgba(15, 23, 42, ${
                backgroundIntensity / 100
              }))`
            : `linear-gradient(to bottom right, rgba(241, 245, 249, ${backgroundIntensity / 100}), rgba(226, 232, 240, ${
                backgroundIntensity / 100
              }))`,
        }}
      >
        <div
          className="space-y-6"
          style={{
            backgroundColor: `color-mix(in srgb, var(--preview-background), transparent ${100 - backgroundIntensity}%)`,
            color: "var(--preview-foreground)",
            padding: selectedDensity.padding,
          }}
        >
          {previewSection === "dashboard" && (
            <div className="space-y-6" style={{ gap: selectedDensity.gap }}>
              <div className="space-y-1">
                <h3
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}
                >
                  CAJPRO Dashboard
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                >
                  Overview of your car projects and activities
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3" style={{ gap: selectedDensity.gap }}>
                <Card
                  style={{
                    backgroundColor: "var(--preview-background)",
                    borderColor: "var(--preview-border)",
                    color: "var(--preview-foreground)",
                  }}
                >
                  <CardHeader style={{ padding: selectedDensity.padding }}>
                    <CardTitle style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}>
                      Active Projects
                    </CardTitle>
                    <CardDescription
                      style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                    >
                      You have 3 active projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent style={{ padding: selectedDensity.padding }}>
                    <div className="text-3xl font-bold" style={{ color: "var(--preview-foreground)" }}>
                      3
                    </div>
                  </CardContent>
                </Card>

                <Card
                  style={{
                    backgroundColor: "var(--preview-background)",
                    borderColor: "var(--preview-border)",
                    color: "var(--preview-foreground)",
                  }}
                >
                  <CardHeader style={{ padding: selectedDensity.padding }}>
                    <CardTitle style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}>
                      Pending Tasks
                    </CardTitle>
                    <CardDescription
                      style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                    >
                      You have 12 tasks to complete
                    </CardDescription>
                  </CardHeader>
                  <CardContent style={{ padding: selectedDensity.padding }}>
                    <div className="text-3xl font-bold" style={{ color: "var(--preview-foreground)" }}>
                      12
                    </div>
                  </CardContent>
                </Card>

                <Card
                  style={{
                    backgroundColor: "var(--preview-background)",
                    borderColor: "var(--preview-border)",
                    color: "var(--preview-foreground)",
                  }}
                >
                  <CardHeader style={{ padding: selectedDensity.padding }}>
                    <CardTitle style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}>
                      Budget Used
                    </CardTitle>
                    <CardDescription
                      style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                    >
                      $14,500 of $20,000
                    </CardDescription>
                  </CardHeader>
                  <CardContent style={{ padding: selectedDensity.padding }}>
                    <div className="text-3xl font-bold" style={{ color: "var(--preview-foreground)" }}>
                      72%
                    </div>
                    <Progress value={72} className="h-2 mt-2" style={{ backgroundColor: "var(--preview-muted)" }} />
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2" style={{ gap: selectedDensity.gap }}>
                <Card
                  style={{
                    backgroundColor: "var(--preview-background)",
                    borderColor: "var(--preview-border)",
                    color: "var(--preview-foreground)",
                  }}
                >
                  <CardHeader style={{ padding: selectedDensity.padding }}>
                    <CardTitle style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}>
                      Recent Activity
                    </CardTitle>
                    <CardDescription
                      style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                    >
                      Latest updates from your projects
                    </CardDescription>
                  </CardHeader>
                  <CardContent
                    className="space-y-4"
                    style={{ padding: selectedDensity.padding, gap: selectedDensity.gap }}
                  >
                    {[
                      { time: "2 hours ago", text: "Added new part: K&N Air Filter" },
                      { time: "5 hours ago", text: "Completed task: Install suspension kit" },
                      { time: "Yesterday", text: "Updated budget for BMW project" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-4 text-sm"
                        style={{ fontSize: selectedDensity.fontSize }}
                      >
                        <div style={{ color: "var(--preview-muted-foreground)" }}>{item.time}</div>
                        <div style={{ color: "var(--preview-foreground)" }}>{item.text}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card
                  style={{
                    backgroundColor: "var(--preview-background)",
                    borderColor: "var(--preview-border)",
                    color: "var(--preview-foreground)",
                  }}
                >
                  <CardHeader style={{ padding: selectedDensity.padding }}>
                    <CardTitle style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}>
                      Upcoming Tasks
                    </CardTitle>
                    <CardDescription
                      style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                    >
                      Tasks due in the next 7 days
                    </CardDescription>
                  </CardHeader>
                  <CardContent
                    className="space-y-4"
                    style={{ padding: selectedDensity.padding, gap: selectedDensity.gap }}
                  >
                    {[
                      { project: "Mustang Restoration", task: "Install new carburetor", due: "Tomorrow" },
                      { project: "BMW M3", task: "Order engine mounts", due: "In 2 days" },
                      { project: "Jeep Wrangler", task: "Test suspension", due: "In 5 days" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between"
                        style={{ fontSize: selectedDensity.fontSize }}
                      >
                        <div>
                          <div style={{ color: "var(--preview-foreground)" }}>{item.task}</div>
                          <div style={{ color: "var(--preview-muted-foreground)" }}>{item.project}</div>
                        </div>
                        <Badge
                          style={{
                            backgroundColor: "var(--preview-primary)",
                            color: "var(--preview-primary-foreground)",
                          }}
                        >
                          {item.due}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {previewSection === "project" && (
            <div className="space-y-6" style={{ gap: selectedDensity.gap }}>
              <div className="space-y-1">
                <h3
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}
                >
                  1967 Mustang Restoration
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                >
                  Classic car restoration project
                </p>
              </div>

              <Tabs defaultValue="overview">
                <TabsList
                  className="grid w-full grid-cols-4"
                  style={{
                    backgroundColor: "var(--preview-muted)",
                    color: "var(--preview-muted-foreground)",
                  }}
                >
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="tasks">Tasks</TabsTrigger>
                  <TabsTrigger value="parts">Parts</TabsTrigger>
                  <TabsTrigger value="gallery">Gallery</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4">
                  <div className="grid gap-4 md:grid-cols-2" style={{ gap: selectedDensity.gap }}>
                    <Card
                      style={{
                        backgroundColor: "var(--preview-background)",
                        borderColor: "var(--preview-border)",
                        color: "var(--preview-foreground)",
                      }}
                    >
                      <CardHeader style={{ padding: selectedDensity.padding }}>
                        <CardTitle style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}>
                          Project Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent
                        className="space-y-4"
                        style={{ padding: selectedDensity.padding, gap: selectedDensity.gap }}
                      >
                        <div className="grid grid-cols-2 gap-4" style={{ gap: selectedDensity.gap }}>
                          <div>
                            <div
                              className="text-sm"
                              style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                            >
                              Start Date
                            </div>
                            <div
                              className="font-medium"
                              style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}
                            >
                              March 15, 2023
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-sm"
                              style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                            >
                              Estimated Completion
                            </div>
                            <div
                              className="font-medium"
                              style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}
                            >
                              November 30, 2023
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-sm"
                              style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                            >
                              Budget
                            </div>
                            <div
                              className="font-medium"
                              style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}
                            >
                              $15,000
                            </div>
                          </div>
                          <div>
                            <div
                              className="text-sm"
                              style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                            >
                              Spent
                            </div>
                            <div
                              className="font-medium"
                              style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}
                            >
                              $9,750
                            </div>
                          </div>
                        </div>

                        <div>
                          <div
                            className="text-sm mb-1"
                            style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                          >
                            Progress
                          </div>
                          <Progress value={65} className="h-2" style={{ backgroundColor: "var(--preview-muted)" }} />
                          <div
                            className="text-sm mt-1 text-right"
                            style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}
                          >
                            65%
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card
                      style={{
                        backgroundColor: "var(--preview-background)",
                        borderColor: "var(--preview-border)",
                        color: "var(--preview-foreground)",
                      }}
                    >
                      <CardHeader style={{ padding: selectedDensity.padding }}>
                        <CardTitle style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}>
                          Project Stats
                        </CardTitle>
                      </CardHeader>
                      <CardContent style={{ padding: selectedDensity.padding }}>
                        <div className="grid grid-cols-2 gap-4" style={{ gap: selectedDensity.gap }}>
                          <div className="flex flex-col items-center justify-center p-4 rounded-lg border">
                            <div className="text-3xl font-bold" style={{ color: "var(--preview-foreground)" }}>
                              24
                            </div>
                            <div
                              className="text-sm"
                              style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                            >
                              Total Tasks
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center p-4 rounded-lg border">
                            <div className="text-3xl font-bold" style={{ color: "var(--preview-foreground)" }}>
                              16
                            </div>
                            <div
                              className="text-sm"
                              style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                            >
                              Completed
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center p-4 rounded-lg border">
                            <div className="text-3xl font-bold" style={{ color: "var(--preview-foreground)" }}>
                              32
                            </div>
                            <div
                              className="text-sm"
                              style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                            >
                              Parts
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center p-4 rounded-lg border">
                            <div className="text-3xl font-bold" style={{ color: "var(--preview-foreground)" }}>
                              18
                            </div>
                            <div
                              className="text-sm"
                              style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                            >
                              Photos
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="tasks" className="mt-4">
                  <Card
                    style={{
                      backgroundColor: "var(--preview-background)",
                      borderColor: "var(--preview-border)",
                      color: "var(--preview-foreground)",
                    }}
                  >
                    <CardHeader
                      className="flex flex-row items-center justify-between"
                      style={{ padding: selectedDensity.padding }}
                    >
                      <CardTitle style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}>
                        Project Tasks
                      </CardTitle>
                      <Button
                        size="sm"
                        style={{
                          backgroundColor: "var(--preview-primary)",
                          color: "var(--preview-primary-foreground)",
                        }}
                      >
                        Add Task
                      </Button>
                    </CardHeader>
                    <CardContent style={{ padding: selectedDensity.padding }}>
                      <div className="space-y-4" style={{ gap: selectedDensity.gap }}>
                        {[
                          {
                            title: "Replace carburetor",
                            status: "In Progress",
                            dueDate: "Aug 15, 2023",
                            priority: "High",
                          },
                          {
                            title: "Rebuild transmission",
                            status: "Planned",
                            dueDate: "Sep 10, 2023",
                            priority: "Medium",
                          },
                          {
                            title: "Restore interior upholstery",
                            status: "Not Started",
                            dueDate: "Oct 5, 2023",
                            priority: "Medium",
                          },
                          {
                            title: "Paint exterior",
                            status: "Not Started",
                            dueDate: "Oct 25, 2023",
                            priority: "High",
                          },
                        ].map((task, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 border rounded-lg"
                            style={{ fontSize: selectedDensity.fontSize }}
                          >
                            <div>
                              <div style={{ color: "var(--preview-foreground)" }}>{task.title}</div>
                              <div
                                className="text-sm flex items-center gap-2"
                                style={{ color: "var(--preview-muted-foreground)" }}
                              >
                                <Clock className="h-3 w-3" /> {task.dueDate}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  task.status === "In Progress"
                                    ? "default"
                                    : task.status === "Completed"
                                      ? "outline"
                                      : "secondary"
                                }
                                style={
                                  task.status === "In Progress"
                                    ? {
                                        backgroundColor: "var(--preview-primary)",
                                        color: "var(--preview-primary-foreground)",
                                      }
                                    : {}
                                }
                              >
                                {task.status}
                              </Badge>
                              <Button size="sm" variant="ghost" style={{ color: "var(--preview-muted-foreground)" }}>
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="parts" className="mt-4">
                  <Card
                    style={{
                      backgroundColor: "var(--preview-background)",
                      borderColor: "var(--preview-border)",
                      color: "var(--preview-foreground)",
                    }}
                  >
                    <CardHeader
                      className="flex flex-row items-center justify-between"
                      style={{ padding: selectedDensity.padding }}
                    >
                      <CardTitle style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}>
                        Parts Inventory
                      </CardTitle>
                      <Button
                        size="sm"
                        style={{
                          backgroundColor: "var(--preview-primary)",
                          color: "var(--preview-primary-foreground)",
                        }}
                      >
                        Add Part
                      </Button>
                    </CardHeader>
                    <CardContent style={{ padding: selectedDensity.padding }}>
                      <div className="space-y-4" style={{ gap: selectedDensity.gap }}>
                        {[
                          {
                            name: "Carburetor",
                            status: "Ordered",
                            cost: "$350",
                            category: "Engine",
                          },
                          {
                            name: "Brake Pads",
                            status: "Installed",
                            cost: "$120",
                            category: "Brakes",
                          },
                          {
                            name: "Suspension Kit",
                            status: "Delivered",
                            cost: "$850",
                            category: "Suspension",
                          },
                          {
                            name: "Upholstery Kit",
                            status: "Ordered",
                            cost: "$1,200",
                            category: "Interior",
                          },
                        ].map((part, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-3 border rounded-lg"
                            style={{ fontSize: selectedDensity.fontSize }}
                          >
                            <div>
                              <div style={{ color: "var(--preview-foreground)" }}>{part.name}</div>
                              <div
                                className="text-sm flex items-center gap-2"
                                style={{ color: "var(--preview-muted-foreground)" }}
                              >
                                <Wrench className="h-3 w-3" /> {part.category}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div style={{ color: "var(--preview-foreground)" }}>{part.cost}</div>
                              <Badge
                                style={{
                                  backgroundColor: "var(--preview-primary)",
                                  color: "var(--preview-primary-foreground)",
                                }}
                              >
                                {part.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="gallery" className="mt-4">
                  <Card
                    style={{
                      backgroundColor: "var(--preview-background)",
                      borderColor: "var(--preview-border)",
                      color: "var(--preview-foreground)",
                    }}
                  >
                    <CardHeader
                      className="flex flex-row items-center justify-between"
                      style={{ padding: selectedDensity.padding }}
                    >
                      <CardTitle style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}>
                        Project Gallery
                      </CardTitle>
                      <Button
                        size="sm"
                        style={{
                          backgroundColor: "var(--preview-primary)",
                          color: "var(--preview-primary-foreground)",
                        }}
                      >
                        Upload Photos
                      </Button>
                    </CardHeader>
                    <CardContent style={{ padding: selectedDensity.padding }}>
                      <div className="grid grid-cols-3 gap-4" style={{ gap: selectedDensity.gap }}>
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                          <div
                            key={item}
                            className="aspect-square rounded-md flex items-center justify-center"
                            style={{ backgroundColor: "var(--preview-muted)" }}
                          >
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {previewSection === "form" && (
            <div className="space-y-6" style={{ gap: selectedDensity.gap }}>
              <div className="space-y-1">
                <h3
                  className="text-2xl font-bold tracking-tight"
                  style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}
                >
                  Add New Project
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                >
                  Enter the details for your new car project
                </p>
              </div>

              <Card
                style={{
                  backgroundColor: "var(--preview-background)",
                  borderColor: "var(--preview-border)",
                  color: "var(--preview-foreground)",
                }}
              >
                <CardHeader style={{ padding: selectedDensity.padding }}>
                  <CardTitle style={{ color: "var(--preview-foreground)", fontSize: selectedDensity.fontSize }}>
                    Project Information
                  </CardTitle>
                  <CardDescription
                    style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                  >
                    Fill out the basic information about your project
                  </CardDescription>
                </CardHeader>
                <CardContent
                  className="space-y-4"
                  style={{ padding: selectedDensity.padding, gap: selectedDensity.gap }}
                >
                  <div className="grid gap-4 md:grid-cols-2" style={{ gap: selectedDensity.gap }}>
                    <div className="space-y-2">
                      <Label htmlFor="project-name" style={{ color: "var(--preview-foreground)" }}>
                        Project Name
                      </Label>
                      <Input
                        id="project-name"
                        placeholder="Enter project name"
                        style={{
                          backgroundColor: "var(--preview-background)",
                          borderColor: "var(--preview-border)",
                          color: "var(--preview-foreground)",
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-type" style={{ color: "var(--preview-foreground)" }}>
                        Project Type
                      </Label>
                      <Select>
                        <SelectTrigger
                          id="project-type"
                          style={{
                            backgroundColor: "var(--preview-background)",
                            borderColor: "var(--preview-border)",
                            color: "var(--preview-foreground)",
                          }}
                        >
                          <SelectValue placeholder="Select project type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restoration">Restoration</SelectItem>
                          <SelectItem value="modification">Modification</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="custom">Custom Build</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="make" style={{ color: "var(--preview-foreground)" }}>
                        Make
                      </Label>
                      <Input
                        id="make"
                        placeholder="Enter vehicle make"
                        style={{
                          backgroundColor: "var(--preview-background)",
                          borderColor: "var(--preview-border)",
                          color: "var(--preview-foreground)",
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model" style={{ color: "var(--preview-foreground)" }}>
                        Model
                      </Label>
                      <Input
                        id="model"
                        placeholder="Enter vehicle model"
                        style={{
                          backgroundColor: "var(--preview-background)",
                          borderColor: "var(--preview-border)",
                          color: "var(--preview-foreground)",
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year" style={{ color: "var(--preview-foreground)" }}>
                        Year
                      </Label>
                      <Input
                        id="year"
                        placeholder="Enter vehicle year"
                        style={{
                          backgroundColor: "var(--preview-background)",
                          borderColor: "var(--preview-border)",
                          color: "var(--preview-foreground)",
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budget" style={{ color: "var(--preview-foreground)" }}>
                        Budget
                      </Label>
                      <Input
                        id="budget"
                        placeholder="Enter project budget"
                        style={{
                          backgroundColor: "var(--preview-background)",
                          borderColor: "var(--preview-border)",
                          color: "var(--preview-foreground)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" style={{ color: "var(--preview-foreground)" }}>
                      Description
                    </Label>
                    <textarea
                      id="description"
                      rows={3}
                      placeholder="Enter project description"
                      className="w-full rounded-md border p-2"
                      style={{
                        backgroundColor: "var(--preview-background)",
                        borderColor: "var(--preview-border)",
                        color: "var(--preview-foreground)",
                      }}
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch id="public-project" />
                      <Label htmlFor="public-project" style={{ color: "var(--preview-foreground)" }}>
                        Make this project public
                      </Label>
                    </div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--preview-muted-foreground)", fontSize: selectedDensity.fontSize }}
                    >
                      Public projects can be viewed by other CAJPRO users
                    </p>
                  </div>
                </CardContent>
                <CardFooter
                  className="flex justify-end gap-2"
                  style={{ padding: selectedDensity.padding, gap: selectedDensity.gap }}
                >
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
                    Create Project
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

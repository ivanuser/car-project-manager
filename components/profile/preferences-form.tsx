"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { updateUserPreferences } from "@/actions/profile-actions"
import { useToast } from "@/hooks/use-toast"
import { ThemePreview } from "./theme-preview"
import { ThemeColorPicker } from "./theme-color-picker"
import { applyColorScheme } from "@/lib/color-theme"

// Define default preferences for safety
const defaultPreferences = {
  theme: "system",
  color_scheme: "default",
  background_intensity: "medium",
  ui_density: "comfortable",
  date_format: "MM/DD/YYYY",
  time_format: "12h",
  measurement_unit: "imperial",
  currency: "USD",
  notification_preferences: {
    email: true,
    push: true,
    maintenance: true,
    project_updates: true,
  },
  display_preferences: {
    default_project_view: "grid",
    default_task_view: "list",
    show_completed_tasks: true,
  }
};

interface PreferencesFormProps {
  preferences?: {
    theme?: string
    color_scheme?: string
    background_intensity?: string
    ui_density?: string
    date_format?: string
    time_format?: string
    measurement_unit?: string
    currency?: string
    notification_preferences?: {
      email?: boolean
      push?: boolean
      maintenance?: boolean
      project_updates?: boolean
    }
    display_preferences?: {
      default_project_view?: string
      default_task_view?: string
      show_completed_tasks?: boolean
    }
  } | null
}

export function PreferencesForm({ preferences = null }: PreferencesFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Safely merge user preferences with defaults to prevent undefined errors
  const mergedPrefs = {
    ...defaultPreferences,
    ...(preferences || {}),
    notification_preferences: {
      ...defaultPreferences.notification_preferences,
      ...(preferences?.notification_preferences || {})
    },
    display_preferences: {
      ...defaultPreferences.display_preferences,
      ...(preferences?.display_preferences || {})
    }
  };

  // Form state - safely initialized with merged preferences
  const [theme, setTheme] = useState(mergedPrefs.theme)
  const [colorScheme, setColorScheme] = useState(mergedPrefs.color_scheme)
  const [backgroundIntensity, setBackgroundIntensity] = useState(mergedPrefs.background_intensity)
  const [uiDensity, setUiDensity] = useState(mergedPrefs.ui_density)
  const [dateFormat, setDateFormat] = useState(mergedPrefs.date_format)
  const [timeFormat, setTimeFormat] = useState(mergedPrefs.time_format)
  const [measurementUnit, setMeasurementUnit] = useState(mergedPrefs.measurement_unit)
  const [currency, setCurrency] = useState(mergedPrefs.currency)

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(mergedPrefs.notification_preferences?.email ?? true)
  const [pushNotifications, setPushNotifications] = useState(mergedPrefs.notification_preferences?.push ?? true)
  const [maintenanceNotifications, setMaintenanceNotifications] = useState(
    mergedPrefs.notification_preferences?.maintenance ?? true
  )
  const [projectUpdateNotifications, setProjectUpdateNotifications] = useState(
    mergedPrefs.notification_preferences?.project_updates ?? true
  )

  // Display preferences
  const [defaultProjectView, setDefaultProjectView] = useState(mergedPrefs.display_preferences?.default_project_view ?? 'grid')
  const [defaultTaskView, setDefaultTaskView] = useState(mergedPrefs.display_preferences?.default_task_view ?? 'list')
  const [showCompletedTasks, setShowCompletedTasks] = useState(mergedPrefs.display_preferences?.show_completed_tasks ?? true)

  // Apply immediate changes to the color scheme
  useEffect(() => {
    if (colorScheme) {
      applyColorScheme(colorScheme);
    }
  }, [colorScheme]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData()

      // Appearance
      formData.append("theme", theme)
      formData.append("colorScheme", colorScheme)
      formData.append("backgroundIntensity", backgroundIntensity)
      formData.append("uiDensity", uiDensity)

      // Regional
      formData.append("dateFormat", dateFormat)
      formData.append("timeFormat", timeFormat)
      formData.append("measurementUnit", measurementUnit)
      formData.append("currency", currency)

      // Notifications
      formData.append("emailNotifications", emailNotifications ? "on" : "off")
      formData.append("pushNotifications", pushNotifications ? "on" : "off")
      formData.append("maintenanceNotifications", maintenanceNotifications ? "on" : "off")
      formData.append("projectUpdateNotifications", projectUpdateNotifications ? "on" : "off")

      // Display
      formData.append("defaultProjectView", defaultProjectView)
      formData.append("defaultTaskView", defaultTaskView)
      formData.append("showCompletedTasks", showCompletedTasks ? "on" : "off")

      const result = await updateUserPreferences(formData)

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Your preferences have been updated",
        })

        // Apply theme changes immediately
        if (theme === "dark") {
          document.documentElement.classList.add("dark")
        } else if (theme === "light") {
          document.documentElement.classList.remove("dark")
        } else {
          // System preference
          const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
          if (prefersDark) {
            document.documentElement.classList.add("dark")
          } else {
            document.documentElement.classList.remove("dark")
          }
        }

        // Apply color scheme
        applyColorScheme(colorScheme)

        // Apply background intensity
        const gradientEl = document.querySelector("[data-gradient-background]")
        if (gradientEl) {
          gradientEl.classList.remove("opacity-0", "opacity-30", "opacity-50", "opacity-70", "opacity-90")

          if (backgroundIntensity === "none") {
            gradientEl.classList.add("opacity-0")
          } else if (backgroundIntensity === "light") {
            gradientEl.classList.add("opacity-30")
          } else if (backgroundIntensity === "medium") {
            gradientEl.classList.add("opacity-50")
          } else if (backgroundIntensity === "strong") {
            gradientEl.classList.add("opacity-70")
          } else if (backgroundIntensity === "max") {
            gradientEl.classList.add("opacity-90")
          }
        }

        router.refresh()
      }
    } catch (error) {
      console.error("Preferences update error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>User Preferences</CardTitle>
          <CardDescription>Customize your CAJPRO experience</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="appearance" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="regional">Regional</TabsTrigger>
            </TabsList>

            <TabsContent value="appearance" className="space-y-6 pt-4">
              <div className="space-y-6">
                <ThemePreview
                  theme={theme}
                  colorScheme={colorScheme}
                  onThemeChange={setTheme}
                  onColorSchemeChange={setColorScheme}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="colorScheme">Color Scheme</Label>
                <ThemeColorPicker value={colorScheme} onChange={setColorScheme} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backgroundIntensity">Background Intensity</Label>
                <Select value={backgroundIntensity} onValueChange={setBackgroundIntensity}>
                  <SelectTrigger id="backgroundIntensity">
                    <SelectValue placeholder="Select background intensity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="uiDensity">UI Density</Label>
                <Select value={uiDensity} onValueChange={setUiDensity}>
                  <SelectTrigger id="uiDensity">
                    <SelectValue placeholder="Select UI density" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="showCompletedTasks">Show Completed Tasks</Label>
                  <Switch
                    id="showCompletedTasks"
                    checked={showCompletedTasks}
                    onCheckedChange={setShowCompletedTasks}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Display completed tasks in task lists</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultProjectView">Default Project View</Label>
                <Select value={defaultProjectView} onValueChange={setDefaultProjectView}>
                  <SelectTrigger id="defaultProjectView">
                    <SelectValue placeholder="Select default project view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultTaskView">Default Task View</Label>
                <Select value={defaultTaskView} onValueChange={setDefaultTaskView}>
                  <SelectTrigger id="defaultTaskView">
                    <SelectValue placeholder="Select default task view" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="kanban">Kanban</SelectItem>
                    <SelectItem value="calendar">Calendar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Receive email notifications for important updates</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifications">Push Notifications</Label>
                  <Switch id="pushNotifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
                <p className="text-sm text-muted-foreground">Receive browser push notifications</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenanceNotifications">Maintenance Reminders</Label>
                  <Switch
                    id="maintenanceNotifications"
                    checked={maintenanceNotifications}
                    onCheckedChange={setMaintenanceNotifications}
                  />
                </div>
                <p className="text-sm text-muted-foreground">Get notified about upcoming and overdue maintenance</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="projectUpdateNotifications">Project Updates</Label>
                  <Switch
                    id="projectUpdateNotifications"
                    checked={projectUpdateNotifications}
                    onCheckedChange={setProjectUpdateNotifications}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about project milestones and updates
                </p>
              </div>
            </TabsContent>

            <TabsContent value="regional" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="dateFormat">Date Format</Label>
                <Select value={dateFormat} onValueChange={setDateFormat}>
                  <SelectTrigger id="dateFormat">
                    <SelectValue placeholder="Select date format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFormat">Time Format</Label>
                <Select value={timeFormat} onValueChange={setTimeFormat}>
                  <SelectTrigger id="timeFormat">
                    <SelectValue placeholder="Select time format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12h">12-hour (AM/PM)</SelectItem>
                    <SelectItem value="24h">24-hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="measurementUnit">Measurement Units</Label>
                <Select value={measurementUnit} onValueChange={setMeasurementUnit}>
                  <SelectTrigger id="measurementUnit">
                    <SelectValue placeholder="Select measurement units" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="imperial">Imperial (miles, lbs)</SelectItem>
                    <SelectItem value="metric">Metric (km, kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">US Dollar ($)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                    <SelectItem value="GBP">British Pound (£)</SelectItem>
                    <SelectItem value="CAD">Canadian Dollar (C$)</SelectItem>
                    <SelectItem value="AUD">Australian Dollar (A$)</SelectItem>
                    <SelectItem value="JPY">Japanese Yen (¥)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

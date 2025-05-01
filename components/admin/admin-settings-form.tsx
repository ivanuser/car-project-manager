"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { type AdminSettings, updateAdminSettings } from "@/actions/admin-actions"
import { useToast } from "@/hooks/use-toast"
import { formatBytes } from "@/utils/format-utils"

export function AdminSettingsForm({ initialSettings }: { initialSettings: AdminSettings }) {
  const [settings, setSettings] = useState<AdminSettings>(initialSettings)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await updateAdminSettings(settings)
      toast({
        title: "Settings updated",
        description: "System settings have been updated successfully.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Control the overall system status and access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">When enabled, only admins can access the system</p>
              </div>
              <Switch
                id="maintenance-mode"
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="allow-registrations">Allow New Registrations</Label>
                <p className="text-sm text-muted-foreground">When disabled, new users cannot register</p>
              </div>
              <Switch
                id="allow-registrations"
                checked={settings.allowNewRegistrations}
                onCheckedChange={(checked) => setSettings({ ...settings, allowNewRegistrations: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Announcement</CardTitle>
            <CardDescription>Display a system-wide announcement to all users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement">Announcement Message</Label>
              <Textarea
                id="announcement"
                placeholder="Enter announcement message..."
                value={settings.systemAnnouncement || ""}
                onChange={(e) => setSettings({ ...settings, systemAnnouncement: e.target.value || null })}
                className="min-h-[100px]"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="announcement-active">Show Announcement</Label>
                <p className="text-sm text-muted-foreground">Display the announcement to all users</p>
              </div>
              <Switch
                id="announcement-active"
                checked={settings.systemAnnouncementActive}
                onCheckedChange={(checked) => setSettings({ ...settings, systemAnnouncementActive: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="announcement-expiry">Expiry Date (Optional)</Label>
              <Input
                id="announcement-expiry"
                type="datetime-local"
                value={
                  settings.systemAnnouncementExpiry
                    ? new Date(
                        settings.systemAnnouncementExpiry.getTime() -
                          settings.systemAnnouncementExpiry.getTimezoneOffset() * 60000,
                      )
                        .toISOString()
                        .slice(0, 16)
                    : ""
                }
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    systemAnnouncementExpiry: e.target.value ? new Date(e.target.value) : null,
                  })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Limits</CardTitle>
            <CardDescription>Set limits for user resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="max-projects">Max Projects Per User: {settings.maxProjectsPerUser}</Label>
              <Input
                id="max-projects"
                type="range"
                min="1"
                max="50"
                value={settings.maxProjectsPerUser}
                onChange={(e) => setSettings({ ...settings, maxProjectsPerUser: Number.parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-storage">Max Storage Per User: {formatBytes(settings.maxStoragePerUser)}</Label>
              <Input
                id="max-storage"
                type="range"
                min={1024 * 1024 * 100} // 100MB
                max={1024 * 1024 * 1024 * 10} // 10GB
                step={1024 * 1024 * 100} // 100MB steps
                value={settings.maxStoragePerUser}
                onChange={(e) => setSettings({ ...settings, maxStoragePerUser: Number.parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-upload">Max Upload Size: {formatBytes(settings.maxUploadSize)}</Label>
              <Input
                id="max-upload"
                type="range"
                min={1024 * 1024} // 1MB
                max={1024 * 1024 * 100} // 100MB
                step={1024 * 1024} // 1MB steps
                value={settings.maxUploadSize}
                onChange={(e) => setSettings({ ...settings, maxUploadSize: Number.parseInt(e.target.value) })}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </form>
  )
}

'use client'

// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { getAdminSettings } from "@/actions/admin-actions"
import { AdminSettingsForm } from "@/components/admin/admin-settings-form"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      try {
        const adminSettings = await getAdminSettings()
        setSettings(adminSettings)
      } catch (error) {
        console.error('Error loading admin settings:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">System Settings</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>

      {settings ? (
        <AdminSettingsForm initialSettings={settings} />
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Failed to load settings</p>
        </div>
      )}
    </div>
  )
}

import { getAdminSettings } from "@/actions/admin-actions"
import { AdminSettingsForm } from "@/components/admin/admin-settings-form"

export const metadata = {
  title: "Admin Settings | CAJPRO",
  description: "Manage system settings and configurations",
}

export default async function AdminSettingsPage() {
  const settings = await getAdminSettings()

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">System Settings</h1>
      </div>

      <AdminSettingsForm initialSettings={settings} />
    </div>
  )
}

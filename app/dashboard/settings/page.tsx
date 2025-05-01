import { createServerClient } from "@/lib/supabase"
import { PreferencesForm } from "@/components/profile/preferences-form"
import { getUserPreferences } from "@/actions/profile-actions"

export default async function SettingsPage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">You must be logged in to view this page.</p>
        </div>
      </div>
    )
  }

  // Get the user's preferences
  const { preferences, error } = await getUserPreferences(user.id)

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
          <p className="text-destructive">Error loading preferences: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your application settings and preferences.</p>
      </div>

      <PreferencesForm preferences={preferences} />
    </div>
  )
}

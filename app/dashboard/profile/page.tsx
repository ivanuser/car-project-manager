import { createServerClient } from "@/lib/supabase"
import { AvatarUpload } from "@/components/profile/avatar-upload"
import { ProfileForm } from "@/components/profile/profile-form"
import { PasswordForm } from "@/components/profile/password-form"
import { getUserProfile } from "@/actions/profile-actions"

export default async function ProfilePage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">You must be logged in to view this page.</p>
        </div>
      </div>
    )
  }

  // Get the user's profile
  const { profile, error } = await getUserProfile(user.id)

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
          <p className="text-destructive">Error loading profile: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile</h2>
        <p className="text-muted-foreground">Manage your account information and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <div>
          <AvatarUpload currentAvatarUrl={profile.avatar_url} userId={user.id} />
        </div>
        <div className="space-y-6">
          <ProfileForm profile={profile} />
          <PasswordForm email={user.email || ""} />
        </div>
      </div>
    </div>
  )
}

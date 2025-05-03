import { createServerClient } from "@/lib/supabase"

/**
 * Ensures a user profile exists in the database
 * This is important because Supabase Auth creates users but doesn't automatically create profiles
 */
export async function ensureUserProfile(userId: string, email: string) {
  try {
    const supabase = createServerClient()
    
    // Check if a profile exists for this user
    const { data: existingProfile, error: profileQueryError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()
      
    if (profileQueryError && profileQueryError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Error checking for existing profile:", profileQueryError)
      return { success: false, error: profileQueryError }
    }
    
    // If profile exists, we're done
    if (existingProfile) {
      return { success: true, data: existingProfile }
    }
    
    // If no profile exists, create one
    console.log(`Creating profile for user ${userId} (${email})`)
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        full_name: email.split('@')[0], // Use the first part of their email as a name placeholder
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()
      
    if (insertError) {
      console.error("Error creating user profile:", insertError)
      return { success: false, error: insertError }
    }
    
    return { success: true, data: newProfile }
  } catch (error) {
    console.error("Unexpected error in ensureUserProfile:", error)
    return { success: false, error }
  }
}

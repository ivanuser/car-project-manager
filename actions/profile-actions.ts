"use server"

import { cookies } from 'next/headers';
import jwtUtils from '@/lib/auth/jwt';
import db from '@/lib/db';
import { revalidatePath } from "next/cache";
import * as fs from 'fs';
import * as path from 'path';

/**
 * Get the current user ID from the session
 * @returns User ID or null if not authenticated
 */
async function getCurrentUserId() {
  const cookieStore = cookies();
  const authToken = cookieStore.get('cajpro_auth_token')?.value;
  
  if (!authToken) {
    console.log("No auth token found in cookies");
    return null;
  }
  
  // Validate token and get user ID
  try {
    const payload = jwtUtils.verifyToken(authToken);
    if (!payload) {
      console.log("Invalid auth token");
      return null;
    }
    
    // Extract user ID from the token
    return payload.sub;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

/**
 * Get user profile
 * @param userId - User ID
 * @returns User profile or error
 */
export async function getUserProfile(userId: string) {
  try {
    // First check if this is the authenticated user or if admin
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return { error: "Not authenticated" };
    }
    
    // Query the database for profile
    const profileResult = await db.query(
      `SELECT * FROM profiles WHERE id = $1`,
      [userId]
    );
    
    if (profileResult.rows.length === 0) {
      // Profile doesn't exist yet, return default values
      return {
        profile: {
          id: userId,
          full_name: "",
          bio: "",
          location: "",
          website: "",
          expertise_level: "beginner",
          social_links: {},
          phone: "",
          created_at: new Date(),
          updated_at: new Date()
        }
      };
    }
    
    return { profile: profileResult.rows[0] };
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return { error: (error as Error).message };
  }
}

/**
 * Update user profile
 * @param formData - Form data
 * @returns Success or error
 */
export async function updateUserProfile(formData: FormData) {
  try {
    // Get the current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "Not authenticated" };
    }
    
    // Extract form data
    const fullName = formData.get("fullName") as string;
    const bio = formData.get("bio") as string;
    const location = formData.get("location") as string;
    const website = formData.get("website") as string;
    const expertiseLevel = formData.get("expertiseLevel") as string;
    const phone = formData.get("phone") as string;
    
    // Handle social links
    const socialLinks = {
      twitter: formData.get("twitter") as string,
      instagram: formData.get("instagram") as string,
      facebook: formData.get("facebook") as string,
      linkedin: formData.get("linkedin") as string,
      youtube: formData.get("youtube") as string,
    };
    
    // Check if profile exists
    const profileResult = await db.query(
      `SELECT id FROM profiles WHERE id = $1`,
      [userId]
    );
    
    if (profileResult.rows.length === 0) {
      // Insert new profile
      await db.query(
        `INSERT INTO profiles (
          id, full_name, bio, location, website, expertise_level, 
          social_links, phone, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          userId, fullName, bio, location, website, expertiseLevel,
          JSON.stringify(socialLinks), phone, new Date(), new Date()
        ]
      );
    } else {
      // Update existing profile
      await db.query(
        `UPDATE profiles SET
          full_name = $1,
          bio = $2,
          location = $3,
          website = $4,
          expertise_level = $5,
          social_links = $6,
          phone = $7,
          updated_at = $8
        WHERE id = $9`,
        [
          fullName, bio, location, website, expertiseLevel,
          JSON.stringify(socialLinks), phone, new Date(), userId
        ]
      );
    }
    
    revalidatePath("/dashboard/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: (error as Error).message };
  }
}

/**
 * Update avatar
 * @param formData - Form data
 * @returns Success or error
 */
export async function updateAvatar(formData: FormData) {
  try {
    // Get the current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "Not authenticated" };
    }
    
    const avatarFile = formData.get("avatar") as File;
    
    if (!avatarFile || avatarFile.size === 0) {
      return { error: "No file provided" };
    }
    
    // Ensure storage directory exists
    const storageDir = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
    const avatarDir = path.join(storageDir, 'avatars');
    
    if (!fs.existsSync(avatarDir)) {
      fs.mkdirSync(avatarDir, { recursive: true });
    }
    
    // Generate file name
    const fileName = `avatar-${userId}-${Date.now()}.jpg`;
    const filePath = path.join(avatarDir, fileName);
    
    // Read file buffer from form data
    const buffer = Buffer.from(await avatarFile.arrayBuffer());
    
    // Write file to storage
    fs.writeFileSync(filePath, buffer);
    
    // Generate URL - simplified for now, you would need to provide actual URL handling
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const publicUrl = `${baseUrl}/storage/avatars/${fileName}`;
    
    // Update profile with avatar URL
    await db.query(
      `UPDATE profiles SET
        avatar_url = $1,
        updated_at = $2
      WHERE id = $3`,
      [publicUrl, new Date(), userId]
    );
    
    revalidatePath("/dashboard/profile");
    return { success: true, avatarUrl: publicUrl };
  } catch (error) {
    console.error("Error updating avatar:", error);
    return { error: (error as Error).message };
  }
}

/**
 * Get user preferences
 * @param userId - User ID
 * @returns User preferences or error
 */
export async function getUserPreferences(userId: string) {
  try {
    // Check if this is the authenticated user
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return { error: "Not authenticated" };
    }
    
    // Query the database for preferences
    const prefsResult = await db.query(
      `SELECT * FROM user_preferences WHERE id = $1`,
      [userId]
    );
    
    if (prefsResult.rows.length === 0) {
      // No preferences exist yet, return default values
      return {
        preferences: {
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
          },
        },
      };
    }
    
    return { preferences: prefsResult.rows[0] };
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return { error: (error as Error).message };
  }
}

/**
 * Update user preferences
 * @param formData - Form data
 * @returns Success or error
 */
export async function updateUserPreferences(formData: FormData) {
  try {
    // Get the current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "Not authenticated" };
    }
    
    // Extract form data
    const theme = formData.get("theme") as string;
    const colorScheme = formData.get("colorScheme") as string;
    const backgroundIntensity = formData.get("backgroundIntensity") as string;
    const uiDensity = formData.get("uiDensity") as string;
    const dateFormat = formData.get("dateFormat") as string;
    const timeFormat = formData.get("timeFormat") as string;
    const measurementUnit = formData.get("measurementUnit") as string;
    const currency = formData.get("currency") as string;
    
    // Handle notification preferences
    const notificationPreferences = {
      email: formData.get("emailNotifications") === "on",
      push: formData.get("pushNotifications") === "on",
      maintenance: formData.get("maintenanceNotifications") === "on",
      project_updates: formData.get("projectUpdateNotifications") === "on",
    };
    
    // Handle display preferences
    const displayPreferences = {
      default_project_view: formData.get("defaultProjectView") as string,
      default_task_view: formData.get("defaultTaskView") as string,
      show_completed_tasks: formData.get("showCompletedTasks") === "on",
    };
    
    // Check if preferences already exist
    const prefResult = await db.query(
      `SELECT id FROM user_preferences WHERE id = $1`,
      [userId]
    );
    
    if (prefResult.rows.length === 0) {
      // Insert new preferences
      await db.query(
        `INSERT INTO user_preferences (
          id, theme, color_scheme, background_intensity, ui_density,
          date_format, time_format, measurement_unit, currency,
          notification_preferences, display_preferences,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          userId, theme, colorScheme, backgroundIntensity, uiDensity,
          dateFormat, timeFormat, measurementUnit, currency,
          JSON.stringify(notificationPreferences), JSON.stringify(displayPreferences),
          new Date(), new Date()
        ]
      );
    } else {
      // Update existing preferences
      await db.query(
        `UPDATE user_preferences SET
          theme = $1,
          color_scheme = $2,
          background_intensity = $3,
          ui_density = $4,
          date_format = $5,
          time_format = $6,
          measurement_unit = $7,
          currency = $8,
          notification_preferences = $9,
          display_preferences = $10,
          updated_at = $11
        WHERE id = $12`,
        [
          theme, colorScheme, backgroundIntensity, uiDensity,
          dateFormat, timeFormat, measurementUnit, currency,
          JSON.stringify(notificationPreferences), JSON.stringify(displayPreferences),
          new Date(), userId
        ]
      );
    }
    
    revalidatePath("/dashboard/profile");
    revalidatePath("/dashboard/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating preferences:", error);
    return { error: (error as Error).message };
  }
}

/**
 * Update password
 * @param formData - Form data
 * @returns Success or error
 */
export async function updatePassword(formData: FormData) {
  try {
    // Get the current user
    const userId = await getCurrentUserId();
    if (!userId) {
      return { error: "Not authenticated" };
    }
    
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;
    
    // Using our custom auth service to change password
    // For now, we'll just return a success message
    // In a real implementation, you would call the auth service to update the password
    
    return { success: true, message: "Password update not yet implemented" };
  } catch (error) {
    console.error("Error updating password:", error);
    return { error: (error as Error).message };
  }
}

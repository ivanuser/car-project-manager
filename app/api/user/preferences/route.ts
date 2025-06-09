// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import authService from '@/lib/auth/production-auth-service';
import db from '@/lib/db';

/**
 * Get the current user ID from the session
 */
async function getCurrentUserId() {
  const cookieStore = cookies();
  // Use the same cookie name as the auth/user endpoint
  const authToken = cookieStore.get('auth-token')?.value;
  
  if (!authToken) {
    console.log("No auth token found in cookies");
    return null;
  }
  
  try {
    // Use the production auth service to validate the session
    const user = await authService.validateSession(authToken);
    if (!user) {
      console.log("Invalid auth token");
      return null;
    }
    
    return user.id;
  } catch (error) {
    console.error("Error getting current user ID:", error);
    return null;
  }
}

/**
 * GET /api/user/preferences
 * Fetches user preferences
 */
export async function GET(req: NextRequest) {
  try {
    // Get userId from query params
    const searchParams = req.nextUrl.searchParams;
    const requestedUserId = searchParams.get('userId');
    
    // Verify authentication
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Use the requested userId or current user ID
    const userId = requestedUserId || currentUserId;
    
    // Security check: only allow access to own preferences unless admin
    if (userId !== currentUserId && process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    // Query the database for preferences
    const preferencesResult = await db.query(
      `SELECT preferences FROM user_preferences WHERE user_id = $1`,
      [userId]
    );
    
    let preferences = {
      theme: 'system',
      color_scheme: 'default',
      background_intensity: 'medium',
      ui_density: 'comfortable',
      date_format: 'MM/DD/YYYY',
      time_format: '12h',
      measurement_unit: 'imperial',
      currency: 'USD',
      notification_preferences: {
        email: true,
        push: true,
        maintenance: true,
        project_updates: true,
      },
      display_preferences: {
        default_project_view: 'grid',
        default_task_view: 'list',
        show_completed_tasks: true,
      }
    };
    
    if (preferencesResult.rows.length > 0) {
      // Merge saved preferences with defaults
      const savedPrefs = preferencesResult.rows[0].preferences;
      preferences = {
        ...preferences,
        ...savedPrefs,
        notification_preferences: {
          ...preferences.notification_preferences,
          ...(savedPrefs.notification_preferences || {})
        },
        display_preferences: {
          ...preferences.display_preferences,
          ...(savedPrefs.display_preferences || {})
        }
      };
    }
    
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Error in preferences API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/preferences
 * Updates user preferences
 */
export async function PUT(req: NextRequest) {
  try {
    // Verify authentication
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    const { preferences } = body;
    
    // Update or insert preferences
    const result = await db.query(`
      INSERT INTO user_preferences (user_id, preferences, updated_at)
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      ON CONFLICT (user_id) 
      DO UPDATE SET
        preferences = EXCLUDED.preferences,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [currentUserId, JSON.stringify(preferences)]);
    
    return NextResponse.json({ 
      success: true, 
      preferences: result.rows[0].preferences 
    });
    
  } catch (error) {
    console.error('Error updating preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

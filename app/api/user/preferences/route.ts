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
  const authToken = cookieStore.get('auth-token')?.value;
  
  console.log("Preferences API: Looking for auth-token cookie:", !!authToken);
  
  if (!authToken) {
    console.log("Preferences API: No auth token found in cookies");
    return null;
  }
  
  try {
    console.log("Preferences API: Validating session");
    const user = await authService.validateSession(authToken);
    if (!user) {
      console.log("Preferences API: Invalid auth token");
      return null;
    }
    
    console.log("Preferences API: Successfully authenticated user:", user.id);
    return user.id;
  } catch (error) {
    console.error("Preferences API: Error getting current user ID:", error);
    return null;
  }
}

/**
 * GET /api/user/preferences
 * Fetches user preferences
 */
export async function GET(req: NextRequest) {
  try {
    console.log("Preferences API: Starting GET request");
    
    // Get userId from query params
    const searchParams = req.nextUrl.searchParams;
    const requestedUserId = searchParams.get('userId');
    console.log("Preferences API: Requested user ID:", requestedUserId);
    
    // Verify authentication
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      console.log("Preferences API: Authentication failed");
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Use the requested userId or current user ID
    const userId = requestedUserId || currentUserId;
    console.log("Preferences API: Using user ID:", userId);
    
    // Security check: only allow access to own preferences unless admin
    if (userId !== currentUserId && process.env.NODE_ENV !== 'development') {
      console.log("Preferences API: Access denied - user mismatch");
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
    
    console.log("Preferences API: Checking database tables");
    
    // Check what tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%preference%'
    `);
    console.log("Preferences API: Available preference tables:", tablesResult.rows);
    
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
    
    try {
      console.log("Preferences API: Querying user_preferences table");
      const preferencesResult = await db.query(
        `SELECT preferences FROM user_preferences WHERE user_id = $1`,
        [userId]
      );
      
      console.log("Preferences API: Query successful, rows found:", preferencesResult.rows.length);
      
      if (preferencesResult.rows.length > 0) {
        const savedPrefs = preferencesResult.rows[0].preferences;
        console.log("Preferences API: Found saved preferences:", savedPrefs);
        
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
      } else {
        console.log("Preferences API: No saved preferences found, using defaults");
      }
    } catch (queryError) {
      console.error("Preferences API: Database query failed:", queryError);
      
      // Try alternative approach or table structure
      try {
        const altResult = await db.query(
          `SELECT * FROM preferences WHERE user_id = $1`,
          [userId]
        );
        console.log("Preferences API: Alternative query successful, rows found:", altResult.rows.length);
        
        if (altResult.rows.length > 0) {
          const savedPrefs = altResult.rows[0];
          preferences = { ...preferences, ...savedPrefs };
        }
      } catch (altError) {
        console.error("Preferences API: Alternative query also failed:", altError);
        console.log("Preferences API: Using default preferences");
      }
    }
    
    console.log("Preferences API: Returning preferences:", preferences);
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error('Preferences API: Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
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
    console.log("Preferences API: Starting PUT request");
    
    // Verify authentication
    const currentUserId = await getCurrentUserId();
    if (!currentUserId) {
      console.log("Preferences API: PUT authentication failed");
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    console.log("Preferences API: PUT request body:", body);
    
    const { preferences } = body;
    
    if (!preferences) {
      console.log("Preferences API: No preferences in request body");
      return NextResponse.json(
        { error: 'Missing preferences data' },
        { status: 400 }
      );
    }
    
    console.log("Preferences API: Attempting to save preferences:", preferences);
    
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
    
    console.log("Preferences API: Successfully saved preferences:", result.rows[0]);
    
    return NextResponse.json({ 
      success: true, 
      preferences: result.rows[0].preferences 
    });
    
  } catch (error) {
    console.error('Preferences API: PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences', details: error.message },
      { status: 500 }
    );
  }
}

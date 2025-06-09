import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * POST /api/debug/create-tables
 * Debug endpoint to create necessary tables
 * Only available in development mode
 */
export async function POST(req: NextRequest) {
  // Only allow in development mode for security
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }
  
  try {
    console.log("Creating tables...");
    
    // Create the user_preferences table with proper structure
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        preferences JSONB DEFAULT '{
          "theme": "system",
          "color_scheme": "default",
          "background_intensity": "medium",
          "ui_density": "comfortable",
          "date_format": "MM/DD/YYYY",
          "time_format": "12h",
          "measurement_unit": "imperial",
          "currency": "USD",
          "notification_preferences": {
            "email": true,
            "push": true,
            "maintenance": true,
            "project_updates": true
          },
          "display_preferences": {
            "default_project_view": "grid",
            "default_task_view": "list",
            "show_completed_tasks": true
          }
        }'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    
    console.log("✓ user_preferences table created");
    
    // Create the profiles table with proper structure
    await db.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE,
        full_name TEXT DEFAULT '',
        bio TEXT DEFAULT '',
        avatar_url TEXT,
        location TEXT DEFAULT '',
        website TEXT DEFAULT '',
        expertise_level TEXT DEFAULT 'beginner',
        social_links JSONB DEFAULT '{}'::jsonb,
        phone TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    
    console.log("✓ profiles table created");
    
    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
    `);
    
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    `);
    
    console.log("✓ indexes created");
    
    // Check if tables were created successfully
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('user_preferences', 'profiles')
      ORDER BY table_name
    `);
    
    console.log("✓ Tables verified:", tables.rows.map(row => row.table_name));
    
    return NextResponse.json({
      success: true,
      message: 'Tables created successfully',
      tables: tables.rows.map(row => row.table_name),
      details: {
        user_preferences: "Created with user_id column and JSONB preferences",
        profiles: "Created with user_id column and all profile fields"
      }
    });
  } catch (error) {
    console.error('Error creating tables:', error);
    return NextResponse.json(
      { error: 'Error creating tables', details: (error as Error).message },
      { status: 500 }
    );
  }
}

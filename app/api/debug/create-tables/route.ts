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
    // Create the user_preferences table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY,
        theme VARCHAR(50) DEFAULT 'system',
        color_scheme VARCHAR(50) DEFAULT 'default',
        background_intensity VARCHAR(50) DEFAULT 'medium',
        ui_density VARCHAR(50) DEFAULT 'comfortable',
        date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
        time_format VARCHAR(10) DEFAULT '12h',
        measurement_unit VARCHAR(20) DEFAULT 'imperial',
        currency VARCHAR(5) DEFAULT 'USD',
        notification_preferences JSONB DEFAULT '{"email": true, "push": true, "maintenance": true, "project_updates": true}'::jsonb,
        display_preferences JSONB DEFAULT '{"default_project_view": "grid", "default_task_view": "list", "show_completed_tasks": true}'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    
    // Create the profiles table if it doesn't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY,
        full_name TEXT,
        bio TEXT,
        avatar_url TEXT,
        location TEXT,
        website TEXT,
        expertise_level TEXT DEFAULT 'beginner',
        social_links JSONB DEFAULT '{}'::jsonb,
        phone TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      );
    `);
    
    // Check if tables were created successfully
    const tables = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name IN ('user_preferences', 'profiles')
    `);
    
    return NextResponse.json({
      success: true,
      message: 'Tables created successfully',
      tables: tables.rows.map(row => row.table_name)
    });
  } catch (error) {
    console.error('Error creating tables:', error);
    return NextResponse.json(
      { error: 'Error creating tables', details: (error as Error).message },
      { status: 500 }
    );
  }
}

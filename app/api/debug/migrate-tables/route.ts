import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * POST /api/debug/migrate-tables
 * Migrate existing tables to the correct schema
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
    console.log("Starting database migration...");
    const migrationResults = [];
    
    // Check what tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('profiles', 'user_profiles', 'user_preferences')
      ORDER BY table_name
    `);
    
    const existingTables = tablesResult.rows.map(row => row.table_name);
    console.log("Existing tables:", existingTables);
    
    // === PROFILES TABLE MIGRATION ===
    if (existingTables.includes('profiles')) {
      console.log("Migrating existing profiles table...");
      
      // Get current columns
      const profileColumnsResult = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'profiles'
        ORDER BY ordinal_position
      `);
      
      const existingColumns = profileColumnsResult.rows.map(row => row.column_name);
      console.log("Existing profile columns:", existingColumns);
      
      // Add missing columns one by one
      const requiredColumns = [
        { name: 'user_id', type: 'UUID', constraint: 'NOT NULL' },
        { name: 'full_name', type: 'TEXT', default: "''" },
        { name: 'bio', type: 'TEXT', default: "''" },
        { name: 'location', type: 'TEXT', default: "''" },
        { name: 'website', type: 'TEXT', default: "''" },
        { name: 'expertise_level', type: 'TEXT', default: "'beginner'" },
        { name: 'phone', type: 'TEXT', default: "''" },
        { name: 'avatar_url', type: 'TEXT' },
        { name: 'social_links', type: 'JSONB', default: "'{}'::jsonb" },
        { name: 'created_at', type: 'TIMESTAMP WITH TIME ZONE', default: 'now()' },
        { name: 'updated_at', type: 'TIMESTAMP WITH TIME ZONE', default: 'now()' }
      ];
      
      for (const column of requiredColumns) {
        if (!existingColumns.includes(column.name)) {
          try {
            let alterQuery = `ALTER TABLE profiles ADD COLUMN ${column.name} ${column.type}`;
            if (column.default) {
              alterQuery += ` DEFAULT ${column.default}`;
            }
            if (column.constraint) {
              alterQuery += ` ${column.constraint}`;
            }
            
            console.log(`Adding column: ${column.name}`);
            await db.query(alterQuery);
            migrationResults.push(`Added column 'profiles.${column.name}'`);
          } catch (error) {
            console.error(`Error adding column ${column.name}:`, error);
            migrationResults.push(`Failed to add column 'profiles.${column.name}': ${error.message}`);
          }
        }
      }
      
      // Add unique constraint on user_id if it doesn't exist
      try {
        await db.query(`ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id)`);
        migrationResults.push("Added unique constraint on profiles.user_id");
      } catch (error) {
        console.log("Unique constraint already exists or failed:", error.message);
      }
      
    } else {
      console.log("Creating new profiles table...");
      await db.query(`
        CREATE TABLE profiles (
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
      migrationResults.push("Created new profiles table");
    }
    
    // === USER_PREFERENCES TABLE MIGRATION ===
    if (existingTables.includes('user_preferences')) {
      console.log("Checking user_preferences table...");
      
      // Get current columns
      const prefsColumnsResult = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'user_preferences'
        ORDER BY ordinal_position
      `);
      
      const existingPrefsColumns = prefsColumnsResult.rows.map(row => row.column_name);
      console.log("Existing preferences columns:", existingPrefsColumns);
      
      // Check if we need to migrate to JSONB structure
      if (!existingPrefsColumns.includes('preferences') && existingPrefsColumns.includes('theme')) {
        console.log("Migrating old preferences structure to JSONB...");
        
        // Add preferences JSONB column
        await db.query(`
          ALTER TABLE user_preferences 
          ADD COLUMN preferences JSONB DEFAULT '{
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
          }'::jsonb
        `);
        
        migrationResults.push("Added JSONB preferences column to user_preferences");
      }
      
      // Add user_id column if missing
      if (!existingPrefsColumns.includes('user_id')) {
        await db.query(`ALTER TABLE user_preferences ADD COLUMN user_id UUID`);
        migrationResults.push("Added user_id column to user_preferences");
      }
      
    } else {
      console.log("Creating new user_preferences table...");
      await db.query(`
        CREATE TABLE user_preferences (
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
      migrationResults.push("Created new user_preferences table");
    }
    
    // Create indexes for better performance
    try {
      await db.query(`CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id)`);
      await db.query(`CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)`);
      migrationResults.push("Created/verified indexes");
    } catch (error) {
      console.log("Index creation failed (might already exist):", error.message);
    }
    
    // === CLEANUP OLD TABLES ===
    if (existingTables.includes('user_profiles')) {
      console.log("Found old user_profiles table, consider removing it");
      migrationResults.push("Warning: old 'user_profiles' table still exists");
    }
    
    console.log("Migration completed successfully");
    
    return NextResponse.json({
      success: true,
      message: 'Database migration completed successfully',
      migrations: migrationResults,
      existingTables,
      details: "Tables have been migrated to the latest schema"
    });
    
  } catch (error) {
    console.error('Error during migration:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: (error as Error).message },
      { status: 500 }
    );
  }
}

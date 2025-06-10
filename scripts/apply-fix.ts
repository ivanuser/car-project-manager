"use strict";

/**
 * Apply Admin Dev Mode Fix
 * 
 * This script runs the SQL from admin-dev-mode-fix.sql through your application's
 * database connection, bypassing the need for direct psql access.
 */

import db from '../lib/db';
import * as fs from 'fs';
import * as path from 'path';

async function applyAdminDevModeFix() {
  console.log('Applying admin-dev-mode fix through application database connection...');
  
  // Read the SQL file
  const sqlPath = path.join(process.cwd(), 'db', 'admin-dev-mode-fix.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');
  
  // Split the SQL into separate statements
  const statements = sql
    .replace(/--.*$/gm, '') // Remove comments
    .split(';')
    .filter(statement => statement.trim() !== '');
  
  console.log(`Found ${statements.length} SQL statements to execute`);
  
  try {
    // Find the admin user ID
    const adminResult = await db.query(
      `SELECT id FROM auth.users WHERE email = 'admin@cajpro.local' LIMIT 1`
    );
    
    if (adminResult.rows.length === 0) {
      console.error('Admin user not found. Creating default admin user...');
      
      // Create admin user if not exists
      await db.query(`
        INSERT INTO auth.users (
          email, 
          password_hash, 
          salt, 
          is_admin, 
          email_confirmed_at
        ) VALUES (
          'admin@cajpro.local',
          '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
          'developmentsalt',
          TRUE,
          NOW()
        ) ON CONFLICT (email) DO NOTHING
      `);
      
      console.log('Admin user created.');
    }
    
    // Check and set up admin preferences
    const adminId = (await db.query(
      `SELECT id FROM auth.users WHERE email = 'admin@cajpro.local' LIMIT 1`
    )).rows[0]?.id;
    
    if (!adminId) {
      throw new Error('Failed to retrieve admin user ID even after creation attempt');
    }
    
    console.log(`Found admin user with ID: ${adminId}`);
    
    // Check if user_preferences table exists
    const tableExists = (await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'user_preferences'
      )
    `)).rows[0]?.exists;
    
    if (!tableExists) {
      console.log('user_preferences table does not exist. Creating it...');
      
      // Create user_preferences table
      await db.query(`
        CREATE TABLE IF NOT EXISTS public.user_preferences (
          id UUID PRIMARY KEY,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          theme TEXT DEFAULT 'system' NOT NULL,
          color_scheme TEXT DEFAULT 'default' NOT NULL,
          background_intensity TEXT DEFAULT 'medium' NOT NULL,
          ui_density TEXT DEFAULT 'comfortable' NOT NULL,
          date_format TEXT DEFAULT 'MM/DD/YYYY' NOT NULL,
          time_format TEXT DEFAULT '12h' NOT NULL,
          measurement_unit TEXT DEFAULT 'imperial' NOT NULL,
          currency TEXT DEFAULT 'USD' NOT NULL,
          notification_preferences JSONB DEFAULT '{"email": true, "push": true, "maintenance": true, "project_updates": true}' NOT NULL,
          display_preferences JSONB DEFAULT '{"default_project_view": "grid", "default_task_view": "list", "show_completed_tasks": true}' NOT NULL
        )
      `);
      
      console.log('user_preferences table created.');
    }
    
    // Check if admin has preferences
    const hasPrefs = (await db.query(
      `SELECT EXISTS (SELECT 1 FROM public.user_preferences WHERE id = $1)`,
      [adminId]
    )).rows[0]?.exists;
    
    if (!hasPrefs) {
      console.log('Admin has no preferences. Creating default preferences...');
      
      // Insert default preferences
      await db.query(`
        INSERT INTO public.user_preferences (
          id, theme, color_scheme, background_intensity, ui_density,
          date_format, time_format, measurement_unit, currency,
          notification_preferences, display_preferences,
          created_at, updated_at
        ) VALUES (
          $1, 'system', 'default', 'medium', 'comfortable',
          'MM/DD/YYYY', '12h', 'imperial', 'USD',
          '{"email": true, "push": true, "maintenance": true, "project_updates": true}'::jsonb, 
          '{"default_project_view": "grid", "default_task_view": "list", "show_completed_tasks": true}'::jsonb,
          NOW(), NOW()
        )
      `, [adminId]);
      
      console.log('Default preferences created for admin user.');
    } else {
      console.log('Admin already has preferences.');
    }
    
    console.log('Admin dev mode fix applied successfully.');
  } catch (error) {
    console.error('Error applying admin dev mode fix:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
applyAdminDevModeFix();

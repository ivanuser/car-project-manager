import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET /api/debug/db-schema
 * Debug endpoint to check database schema
 * Only available in development mode
 */
export async function GET(req: NextRequest) {
  // Only allow in development mode for security
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development mode' },
      { status: 403 }
    );
  }
  
  try {
    // Check if the user_preferences table exists
    const tableCheckResult = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'user_preferences'
      ) as exists
    `);
    
    const tableExists = tableCheckResult.rows[0].exists;
    
    // Get table structure if it exists
    let schema = null;
    if (tableExists) {
      const schemaResult = await db.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'user_preferences'
        ORDER BY ordinal_position
      `);
      schema = schemaResult.rows;
    }
    
    // Check table data - list of IDs and count
    let data = null;
    if (tableExists) {
      const dataResult = await db.query('SELECT id FROM user_preferences');
      const countResult = await db.query('SELECT COUNT(*) as count FROM user_preferences');
      data = {
        ids: dataResult.rows.map(row => row.id),
        count: countResult.rows[0].count
      };
    }
    
    // If table doesn't exist, generate SQL to create it
    const createTableSQL = tableExists ? null : `
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
    `;
    
    return NextResponse.json({
      tableExists,
      schema,
      data,
      createTableSQL
    });
  } catch (error) {
    console.error('Error checking database schema:', error);
    return NextResponse.json(
      { error: 'Error checking database schema', details: (error as Error).message },
      { status: 500 }
    );
  }
}

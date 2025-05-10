import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

/**
 * GET /api/debug/connection
 * Debug endpoint to check database connection
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
    // Check database connection by running a simple query
    const result = await db.query('SELECT NOW() as time');
    
    // Get database configuration without sensitive info
    const dbConfig = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'cajpro',
      user: process.env.POSTGRES_USER || 'cajpro',
      // Don't include password
    };
    
    // Check environment variables
    const envVariables = {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set (not showing value)' : 'Not set',
      POSTGRES_HOST: process.env.POSTGRES_HOST || 'Not set',
      POSTGRES_PORT: process.env.POSTGRES_PORT || 'Not set',
      POSTGRES_DB: process.env.POSTGRES_DB || 'Not set',
      POSTGRES_USER: process.env.POSTGRES_USER || 'Not set',
      POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD ? 'Set (not showing value)' : 'Not set',
    };
    
    // Get list of all tables in the database
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    return NextResponse.json({
      connection: 'success',
      currentTime: result.rows[0].time,
      dbConfig,
      envVariables,
      tables: tablesResult.rows.map(row => row.table_name)
    });
  } catch (error) {
    console.error('Error checking database connection:', error);
    return NextResponse.json(
      { 
        connection: 'error', 
        error: 'Error checking database connection', 
        details: (error as Error).message,
        stack: (error as Error).stack
      },
      { status: 500 }
    );
  }
}

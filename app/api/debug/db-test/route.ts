import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

export async function GET(request: NextRequest) {
  let client;
  try {
    console.log('=== Database Connection Test ===');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL value:', process.env.DATABASE_URL ? 'Set (hidden for security)' : 'Not set');
    
    // Create pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    console.log('Pool created successfully');
    
    // Test connection
    client = await pool.connect();
    console.log('Database connection established');
    
    // Test basic query
    const versionResult = await client.query('SELECT version()');
    console.log('PostgreSQL version query successful');
    
    // Test if users table exists
    const tableExistsQuery = `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;
    const tableExistsResult = await client.query(tableExistsQuery);
    const usersTableExists = tableExistsResult.rows[0].exists;
    console.log('Users table exists:', usersTableExists);
    
    let userCount = 0;
    if (usersTableExists) {
      // Count users if table exists
      const countResult = await client.query('SELECT COUNT(*) FROM users');
      userCount = parseInt(countResult.rows[0].count);
      console.log('User count:', userCount);
    }
    
    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        version: versionResult.rows[0].version,
        usersTableExists,
        userCount
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrlSet: !!process.env.DATABASE_URL
      }
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        type: error instanceof Error ? error.name : typeof error
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrlSet: !!process.env.DATABASE_URL
      }
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
      console.log('Database client released');
    }
  }
}
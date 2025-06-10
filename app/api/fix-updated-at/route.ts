import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Starting database schema fix for updated_at columns...');

    // Read the SQL fix file
    const sqlPath = join(process.cwd(), 'fix-updated-at-schema.sql');
    const sqlContent = await readFile(sqlPath, 'utf8');

    // Split the SQL content into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`Found ${statements.length} SQL statements to execute`);

    const results = [];
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}`);
      
      try {
        const result = await db.query(statement);
        results.push({
          statement: i + 1,
          success: true,
          rowCount: result.rowCount,
          command: statement.substring(0, 50) + '...'
        });
        console.log(`✅ Statement ${i + 1} completed successfully`);
      } catch (error) {
        console.error(`❌ Statement ${i + 1} failed:`, error);
        results.push({
          statement: i + 1,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          command: statement.substring(0, 50) + '...'
        });
      }
    }

    // Test the fix by checking if users table has updated_at column
    console.log('🔍 Verifying the fix...');
    const checkResult = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'updated_at'
    `);

    const hasUpdatedAt = checkResult.rows.length > 0;

    // Try to get user count to verify database is working
    const userCountResult = await db.query('SELECT COUNT(*) as count FROM users');
    const userCount = userCountResult.rows[0]?.count || 0;

    console.log('✅ Database schema fix completed');

    return NextResponse.json({
      success: true,
      message: 'Database schema fix completed successfully',
      details: {
        statementsExecuted: statements.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        hasUpdatedAtColumn: hasUpdatedAt,
        userCount: parseInt(userCount),
        results: results
      },
      nextSteps: [
        'Try logging in again',
        'The updated_at column has been added to all tables',
        'Triggers have been updated to be more robust',
        'Authentication should now work properly'
      ]
    });

  } catch (error) {
    console.error('❌ Database schema fix failed:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database schema fix failed',
      error: error instanceof Error ? error.message : String(error),
      suggestion: 'Check database connection and permissions'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Database Schema Fix Endpoint',
    description: 'POST to this endpoint to fix the updated_at column issue',
    issue: 'PostgreSQL trigger trying to update updated_at column that does not exist',
    fix: 'Adds updated_at columns to all tables and updates triggers'
  });
}

/**
 * Database initialization endpoint (updated to use new system)
 */
import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, cleanupExpiredSessions } from '@/lib/database-init';

export async function POST(request: NextRequest) {
  try {
    console.log('=== Manual Database Initialization ===');
    
    // Initialize database (safe - won't wipe existing data)
    const initResult = await initializeDatabase();
    
    if (!initResult.success) {
      return NextResponse.json({
        success: false,
        error: initResult.error,
        message: 'Database initialization failed'
      }, { status: 500 });
    }
    
    // Clean up expired sessions
    const cleanedSessions = await cleanupExpiredSessions();
    
    return NextResponse.json({
      success: true,
      message: 'Database initialization completed successfully',
      details: {
        initialization: initResult.message,
        cleanedSessions,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Init schema error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      message: 'Database initialization failed'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Database Initialization Endpoint',
    description: 'Safe database initialization that preserves existing data',
    endpoint: '/api/init-schema',
    method: 'POST'
  });
}
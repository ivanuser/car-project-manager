import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection with better error handling
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    console.log('Debug users API called');
    console.log('Database URL exists:', !!process.env.DATABASE_URL);
    
    // Test connection first
    const client = await pool.connect();
    console.log('Database connection successful');
    
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (email) {
      console.log('Checking specific user:', email);
      // Check specific user
      const userQuery = `
        SELECT id, email, created_at, last_login, is_active
        FROM users 
        WHERE email = $1
      `;
      const userResult = await client.query(userQuery, [email]);
      
      client.release();
      
      if (userResult.rows.length > 0) {
        console.log('User found:', userResult.rows[0]);
        return NextResponse.json({
          found: true,
          user: userResult.rows[0]
        });
      } else {
        console.log('User not found');
        return NextResponse.json({
          found: false,
          message: `User with email ${email} not found`
        });
      }
    } else {
      console.log('Listing all users');
      // List all users
      const allUsersQuery = `
        SELECT id, email, created_at, last_login, is_active
        FROM users 
        ORDER BY created_at DESC
        LIMIT 10
      `;
      const allUsersResult = await client.query(allUsersQuery);
      
      client.release();
      
      console.log('Found users:', allUsersResult.rows.length);
      return NextResponse.json({
        users: allUsersResult.rows,
        count: allUsersResult.rows.length
      });
    }
  } catch (error) {
    console.error('Detailed error in debug users API:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('Database URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    return NextResponse.json(
      { 
        error: 'Failed to check users',
        details: error instanceof Error ? error.message : String(error),
        dbUrlExists: !!process.env.DATABASE_URL
      },
      { status: 500 }
    );
  }
}
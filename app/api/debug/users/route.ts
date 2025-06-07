import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (email) {
      // Check specific user
      const userQuery = `
        SELECT id, email, created_at, last_login, is_active
        FROM users 
        WHERE email = $1
      `;
      const userResult = await pool.query(userQuery, [email]);
      
      if (userResult.rows.length > 0) {
        return NextResponse.json({
          found: true,
          user: userResult.rows[0]
        });
      } else {
        return NextResponse.json({
          found: false,
          message: `User with email ${email} not found`
        });
      }
    } else {
      // List all users
      const allUsersQuery = `
        SELECT id, email, created_at, last_login, is_active
        FROM users 
        ORDER BY created_at DESC
        LIMIT 10
      `;
      const allUsersResult = await pool.query(allUsersQuery);
      
      return NextResponse.json({
        users: allUsersResult.rows,
        count: allUsersResult.rows.length
      });
    }
  } catch (error) {
    console.error('Error checking users:', error);
    return NextResponse.json(
      { error: 'Failed to check users' },
      { status: 500 }
    );
  }
}
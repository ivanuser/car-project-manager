import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  let client;
  try {
    console.log('=== Database Schema Initialization ===');
    
    client = await pool.connect();
    console.log('Database connection established');
    
    // Create users table
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        is_admin BOOLEAN DEFAULT false,
        email_verified BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE
      );
    `;
    
    await client.query(createUsersTable);
    console.log('✅ Users table created');
    
    // Create user_profiles table
    const createProfilesTable = `
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        avatar_url TEXT,
        bio TEXT,
        location VARCHAR(255),
        website VARCHAR(255),
        phone VARCHAR(20),
        twitter VARCHAR(255),
        instagram VARCHAR(255),
        facebook VARCHAR(255),
        linkedin VARCHAR(255),
        youtube VARCHAR(255),
        expertise_level VARCHAR(50) DEFAULT 'intermediate',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `;
    
    await client.query(createProfilesTable);
    console.log('✅ User profiles table created');
    
    // Create user_preferences table
    const createPreferencesTable = `
      CREATE TABLE IF NOT EXISTS user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        theme VARCHAR(20) DEFAULT 'system',
        color_scheme VARCHAR(20) DEFAULT 'default',
        background_intensity VARCHAR(20) DEFAULT 'medium',
        ui_density VARCHAR(20) DEFAULT 'comfortable',
        date_format VARCHAR(20) DEFAULT 'MM/DD/YYYY',
        time_format VARCHAR(10) DEFAULT '12h',
        measurement_unit VARCHAR(20) DEFAULT 'imperial',
        currency VARCHAR(10) DEFAULT 'USD',
        notification_preferences JSONB DEFAULT '{}',
        display_preferences JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `;
    
    await client.query(createPreferencesTable);
    console.log('✅ User preferences table created');
    
    // Create updated_at trigger function
    const createTriggerFunction = `
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `;
    
    await client.query(createTriggerFunction);
    console.log('✅ Trigger function created');
    
    // Create triggers for updated_at
    const createTriggers = [
      `DROP TRIGGER IF EXISTS update_users_updated_at ON users;`,
      `CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;`,
      `CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;`,
      `CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`
    ];
    
    for (const trigger of createTriggers) {
      await client.query(trigger);
    }
    console.log('✅ Triggers created');
    
    // Verify tables exist
    const verifyQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'user_profiles', 'user_preferences')
      ORDER BY table_name;
    `;
    
    const verifyResult = await client.query(verifyQuery);
    const tables = verifyResult.rows.map(row => row.table_name);
    
    console.log('✅ Tables verified:', tables);
    
    return NextResponse.json({
      success: true,
      message: 'Database schema initialized successfully',
      tables: tables,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Database initialization error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  } finally {
    if (client) {
      client.release();
    }
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Database initialization endpoint. Use POST to initialize schema.',
    endpoint: '/api/init-schema',
    method: 'POST'
  });
}
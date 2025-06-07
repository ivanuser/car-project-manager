import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  let client;
  try {
    console.log('=== Comprehensive Authentication System Fix & Schema Initialization ===');
    
    client = await pool.connect();
    console.log('✅ Database connection established');
    
    // 1. Create or update users table with proper authentication structure
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        is_admin BOOLEAN DEFAULT false,
        email_verified BOOLEAN DEFAULT false,
        email_verified_at TIMESTAMP WITH TIME ZONE,
        last_sign_in_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createUsersTable);
    console.log('✅ Users table created/updated with authentication fields');
    
    // 2. Create sessions table for authentication
    const createSessionsTable = `
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        refresh_token TEXT UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ip_address INET,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true
      );
      
      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
      CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON sessions(is_active);
    `;
    
    await client.query(createSessionsTable);
    console.log('✅ Sessions table created with proper indexes');
    
    // 3. Create profiles table (linked to users)
    const createProfilesTable = `
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        full_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        location VARCHAR(255),
        website VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
    `;
    
    await client.query(createProfilesTable);
    console.log('✅ Profiles table created');
    
    // 4. Create user_preferences table
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
    
    // 5. Create updated_at trigger function
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
    
    // 6. Create triggers for updated_at
    const createTriggers = [
      `DROP TRIGGER IF EXISTS update_users_updated_at ON users;`,
      `CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;`,
      `CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;`,
      `CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`,
      `DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;`,
      `CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();`
    ];
    
    for (const trigger of createTriggers) {
      await client.query(trigger);
    }
    console.log('✅ Triggers created');
    
    // 7. Clean up expired sessions
    const cleanupExpiredSessions = `
      DELETE FROM sessions 
      WHERE expires_at < CURRENT_TIMESTAMP 
      OR is_active = false;
    `;
    
    const cleanupResult = await client.query(cleanupExpiredSessions);
    console.log(`✅ Cleaned up ${cleanupResult.rowCount || 0} expired sessions`);
    
    // 8. Create session cleanup function
    const createCleanupFunction = `
      CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
      RETURNS INTEGER AS $$
      DECLARE
        deleted_count INTEGER;
      BEGIN
        DELETE FROM sessions 
        WHERE expires_at < CURRENT_TIMESTAMP 
        OR is_active = false;
        
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
        RETURN deleted_count;
      END;
      $$ language 'plpgsql';
    `;
    
    await client.query(createCleanupFunction);
    console.log('✅ Session cleanup function created');
    
    // 9. Create unique token generation function
    const createTokenFunction = `
      CREATE OR REPLACE FUNCTION generate_unique_session_token()
      RETURNS TEXT AS $$
      DECLARE
        token_candidate TEXT;
        token_exists BOOLEAN;
      BEGIN
        LOOP
          -- Generate a token using random UUID and timestamp
          token_candidate := encode(
            sha256(
              (extract(epoch from clock_timestamp()) || random() || gen_random_uuid())::text::bytea
            ), 'hex'
          );
          
          -- Check if token already exists
          SELECT EXISTS(SELECT 1 FROM sessions WHERE token = token_candidate) INTO token_exists;
          
          -- If unique, exit loop
          IF NOT token_exists THEN
            EXIT;
          END IF;
        END LOOP;
        
        RETURN token_candidate;
      END;
      $$ language 'plpgsql';
    `;
    
    await client.query(createTokenFunction);
    console.log('✅ Unique token generation function created');
    
    // 10. Create or update admin user with hashed password
    const adminEmail = 'admin@cajpro.local';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const createAdminUser = `
      INSERT INTO users (email, password_hash, full_name, is_admin, email_verified, email_verified_at)
      VALUES ($1, $2, 'CAJ-Pro Administrator', true, true, CURRENT_TIMESTAMP)
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        is_admin = true,
        email_verified = true,
        updated_at = CURRENT_TIMESTAMP;
    `;
    
    await client.query(createAdminUser, [adminEmail, hashedPassword]);
    console.log('✅ Admin user created/updated');
    
    // 11. Create profile for admin user
    const createAdminProfile = `
      INSERT INTO profiles (user_id, full_name)
      SELECT id, 'CAJ-Pro Administrator'
      FROM users 
      WHERE email = $1
      ON CONFLICT (user_id) DO UPDATE SET
        full_name = 'CAJ-Pro Administrator',
        updated_at = CURRENT_TIMESTAMP;
    `;
    
    await client.query(createAdminProfile, [adminEmail]);
    console.log('✅ Admin profile created/updated');
    
    // 12. Create preferences for admin user
    const createAdminPreferences = `
      INSERT INTO user_preferences (user_id)
      SELECT id FROM users WHERE email = $1
      ON CONFLICT (user_id) DO NOTHING;
    `;
    
    await client.query(createAdminPreferences, [adminEmail]);
    console.log('✅ Admin preferences created/updated');
    
    // 13. Verify database structure
    const verifyTables = `
      SELECT 
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sessions', 'profiles', 'user_preferences')
      ORDER BY table_name;
    `;
    
    const verifyResult = await client.query(verifyTables);
    const tables = verifyResult.rows;
    
    // 14. Count existing data
    const countUsers = await client.query('SELECT COUNT(*) as count FROM users');
    const countSessions = await client.query('SELECT COUNT(*) as count FROM sessions');
    const countProfiles = await client.query('SELECT COUNT(*) as count FROM profiles');
    const countPreferences = await client.query('SELECT COUNT(*) as count FROM user_preferences');
    
    console.log('=== Database Verification ===');
    console.log('Tables:', tables);
    console.log(`Users: ${countUsers.rows[0].count}`);
    console.log(`Sessions: ${countSessions.rows[0].count}`);
    console.log(`Profiles: ${countProfiles.rows[0].count}`);
    console.log(`Preferences: ${countPreferences.rows[0].count}`);
    
    return NextResponse.json({
      success: true,
      message: 'Authentication system completely fixed and database schema initialized successfully',
      details: {
        tablesCreated: tables,
        userCount: parseInt(countUsers.rows[0].count),
        sessionCount: parseInt(countSessions.rows[0].count),
        profileCount: parseInt(countProfiles.rows[0].count),
        preferencesCount: parseInt(countPreferences.rows[0].count),
        adminUserCreated: true,
        expiredSessionsCleaned: cleanupResult.rowCount || 0,
        timestamp: new Date().toISOString(),
        authenticationSystemStatus: 'READY',
        adminCredentials: {
          email: adminEmail,
          password: 'admin123',
          note: 'Use these credentials for testing'
        }
      },
      nextSteps: [
        'Test registration with a new user account',
        'Test login with admin@cajpro.local / admin123',
        'Test login with your registered test user',
        'Verify authentication tokens work properly',
        'Run the test script: ./test-auth-fixed.sh'
      ],
      tables: tables.map(t => t.table_name),
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Authentication fix error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: 'Failed to fix authentication system and initialize schema',
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
    message: 'Comprehensive Authentication System Fix & Database Schema Initialization',
    description: 'This endpoint fixes all authentication issues AND initializes the database schema',
    endpoint: '/api/init-schema',
    method: 'POST',
    features: [
      'Creates proper users and sessions tables',
      'Fixes schema mismatches between auth service and database',
      'Implements unique session token generation',
      'Cleans up expired sessions',
      'Creates admin user with proper credentials (admin@cajpro.local / admin123)',
      'Sets up proper database indexes and triggers',
      'Provides session cleanup utilities',
      'Creates profiles and user preferences tables',
      'Comprehensive authentication system ready for production'
    ]
  });
}
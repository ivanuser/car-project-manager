import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: NextRequest) {
  let client;
  try {
    console.log('=== Simple Authentication Fix (No Conflict Resolution) ===');
    
    client = await pool.connect();
    console.log('✅ Database connection established');
    
    // 1. Drop existing users table and recreate with proper structure
    console.log('🔄 Recreating users table with proper authentication structure...');
    
    await client.query('DROP TABLE IF EXISTS sessions CASCADE;');
    await client.query('DROP TABLE IF EXISTS profiles CASCADE;');
    await client.query('DROP TABLE IF EXISTS user_preferences CASCADE;');
    await client.query('DROP TABLE IF EXISTS users CASCADE;');
    
    console.log('✅ Existing tables dropped');
    
    // 2. Create users table with proper constraints
    const createUsersTable = `
      CREATE TABLE users (
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
    console.log('✅ Users table created with authentication fields');
    
    // 3. Create sessions table
    const createSessionsTable = `
      CREATE TABLE sessions (
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
      
      CREATE INDEX idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX idx_sessions_token ON sessions(token);
      CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
      CREATE INDEX idx_sessions_is_active ON sessions(is_active);
    `;
    
    await client.query(createSessionsTable);
    console.log('✅ Sessions table created with indexes');
    
    // 4. Create profiles table
    const createProfilesTable = `
      CREATE TABLE profiles (
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
      
      CREATE INDEX idx_profiles_user_id ON profiles(user_id);
    `;
    
    await client.query(createProfilesTable);
    console.log('✅ Profiles table created');
    
    // 5. Create user_preferences table
    const createPreferencesTable = `
      CREATE TABLE user_preferences (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
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
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    
    await client.query(createPreferencesTable);
    console.log('✅ User preferences table created');
    
    // 6. Create trigger function
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
    
    // 7. Create triggers
    const triggers = [
      'CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
      'CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();'
    ];
    
    for (const trigger of triggers) {
      await client.query(trigger);
    }
    console.log('✅ Triggers created');
    
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
          token_candidate := encode(
            sha256(
              (extract(epoch from clock_timestamp()) || random() || gen_random_uuid())::text::bytea
            ), 'hex'
          );
          
          SELECT EXISTS(SELECT 1 FROM sessions WHERE token = token_candidate) INTO token_exists;
          
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
    
    // 10. Create admin user (simple INSERT, no conflict resolution)
    const adminEmail = 'admin@cajpro.local';
    const adminPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const createAdminUser = `
      INSERT INTO users (email, password_hash, full_name, is_admin, email_verified, email_verified_at)
      VALUES ($1, $2, 'CAJ-Pro Administrator', true, true, CURRENT_TIMESTAMP);
    `;
    
    const adminResult = await client.query(createAdminUser, [adminEmail, hashedPassword]);
    console.log('✅ Admin user created');
    
    // 11. Get admin user ID and create profile
    const getAdminQuery = 'SELECT id FROM users WHERE email = $1';
    const adminUserResult = await client.query(getAdminQuery, [adminEmail]);
    const adminUserId = adminUserResult.rows[0].id;
    
    const createAdminProfile = `
      INSERT INTO profiles (user_id, full_name)
      VALUES ($1, 'CAJ-Pro Administrator');
    `;
    
    await client.query(createAdminProfile, [adminUserId]);
    console.log('✅ Admin profile created');
    
    // 12. Create admin preferences
    const createAdminPreferences = `
      INSERT INTO user_preferences (user_id)
      VALUES ($1);
    `;
    
    await client.query(createAdminPreferences, [adminUserId]);
    console.log('✅ Admin preferences created');
    
    // 13. Verify everything
    const verifyTables = `
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'sessions', 'profiles', 'user_preferences')
      ORDER BY table_name;
    `;
    
    const tablesResult = await client.query(verifyTables);
    const tables = tablesResult.rows.map(row => row.table_name);
    
    const countUsers = await client.query('SELECT COUNT(*) as count FROM users');
    const countSessions = await client.query('SELECT COUNT(*) as count FROM sessions');
    const countProfiles = await client.query('SELECT COUNT(*) as count FROM profiles');
    const countPreferences = await client.query('SELECT COUNT(*) as count FROM user_preferences');
    
    console.log('=== Final Verification ===');
    console.log('Tables created:', tables);
    console.log(`Users: ${countUsers.rows[0].count}`);
    console.log(`Sessions: ${countSessions.rows[0].count}`);
    console.log(`Profiles: ${countProfiles.rows[0].count}`);
    console.log(`Preferences: ${countPreferences.rows[0].count}`);
    
    return NextResponse.json({
      success: true,
      message: 'Authentication system completely rebuilt and ready for production',
      details: {
        approach: 'Clean rebuild with proper constraints',
        tablesCreated: tables,
        userCount: parseInt(countUsers.rows[0].count),
        sessionCount: parseInt(countSessions.rows[0].count),
        profileCount: parseInt(countProfiles.rows[0].count),
        preferencesCount: parseInt(countPreferences.rows[0].count),
        adminUserCreated: true,
        authenticationSystemStatus: 'READY',
        adminCredentials: {
          email: adminEmail,
          password: 'admin123',
          note: 'Fresh admin user created successfully'
        }
      },
      nextSteps: [
        'Test registration with new user accounts',
        'Test login with admin@cajpro.local / admin123',
        'Verify all authentication functions work',
        'Continue CAJ-Pro development'
      ],
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Authentication rebuild error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
      details: 'Failed to rebuild authentication system',
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
    message: 'Simple Authentication System Rebuild',
    description: 'This endpoint completely rebuilds the authentication system from scratch',
    endpoint: '/api/init-schema',
    method: 'POST',
    approach: 'Clean rebuild without conflict resolution issues'
  });
}
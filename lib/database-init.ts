import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * Initialize database schema ONLY if tables don't exist
 * This runs on server startup but won't wipe existing data
 */
export async function initializeDatabase() {
  let client;
  try {
    client = await pool.connect();
    
    // Check if users table exists
    const checkUsersTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (checkUsersTable.rows[0].exists) {
      console.log('✅ Database already initialized, skipping schema creation');
      return { success: true, message: 'Database already initialized' };
    }
    
    console.log('🔧 First-time database initialization...');
    
    // Enable UUID extension
    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        is_admin BOOLEAN DEFAULT false,
        email_verified BOOLEAN DEFAULT true,
        email_verified_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_sign_in_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        refresh_token TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        ip_address INET,
        user_agent TEXT,
        is_active BOOLEAN DEFAULT true
      );
      
      CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
      CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
    `);
    
    // Create profiles table
    await client.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        full_name TEXT,
        avatar_url TEXT,
        bio TEXT,
        location VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create trigger function
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);
    
    // Create triggers
    await client.query(`
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at 
        BEFORE UPDATE ON users 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        
      DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
      CREATE TRIGGER update_profiles_updated_at 
        BEFORE UPDATE ON profiles 
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);
    
    // Create default admin user ONLY if no users exist
    const userCount = await client.query('SELECT COUNT(*) as count FROM users');
    
    if (parseInt(userCount.rows[0].count) === 0) {
      const adminEmail = 'admin@cajpro.local';
      const adminPassword = 'admin123';
      const hashedPassword = await bcrypt.hash(adminPassword, 12);
      
      const adminResult = await client.query(`
        INSERT INTO users (email, password_hash, full_name, is_admin, email_verified, email_verified_at)
        VALUES ($1, $2, 'CAJ-Pro Administrator', true, true, CURRENT_TIMESTAMP)
        RETURNING id;
      `, [adminEmail, hashedPassword]);
      
      const adminId = adminResult.rows[0].id;
      
      // Create admin profile
      await client.query(`
        INSERT INTO profiles (user_id, full_name)
        VALUES ($1, 'CAJ-Pro Administrator');
      `, [adminId]);
      
      console.log('✅ Default admin user created: admin@cajpro.local / admin123');
    }
    
    console.log('✅ Database initialization completed successfully');
    return { success: true, message: 'Database initialized successfully' };
    
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return { success: false, error: error.message };
  } finally {
    if (client) {
      client.release();
    }
  }
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions() {
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(`
      DELETE FROM sessions 
      WHERE expires_at < CURRENT_TIMESTAMP OR is_active = false
    `);
    
    if (result.rowCount > 0) {
      console.log(`🧹 Cleaned up ${result.rowCount} expired sessions`);
    }
    
    return result.rowCount;
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
    return 0;
  } finally {
    if (client) {
      client.release();
    }
  }
}
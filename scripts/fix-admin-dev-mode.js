/**
 * Fix Admin Dev Mode Script (JavaScript Version)
 * 
 * This script ensures that the admin@cajpro.local user has correctly set up
 * user preferences with a valid UUID.
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

// Initialize the database connection
const initPool = () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  // Create connection pool
  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production' ? 
      { rejectUnauthorized: false } : false,
  });
  
  // Log when the pool establishes a new connection
  pool.on('connect', () => {
    console.log('PostgreSQL pool connection established');
  });
  
  // Log errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
  });
  
  return pool;
};

const pool = initPool();

// Helper function to execute queries
const query = async (text, params = []) => {
  const start = Date.now();
  
  try {
    console.log('Executing query:', text);
    if (params.length > 0) {
      console.log('Query parameters:', params);
    }
    
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log('Query result:', { 
      rowCount: result.rowCount, 
      duration 
    });
    
    return result;
  } catch (error) {
    console.error('Query error:', { text, params, error });
    throw error;
  }
};

async function fixAdminDevMode() {
  console.log('Starting fix for admin-dev-mode user preferences...');
  
  try {
    // Find the admin user to get the proper UUID
    console.log('Looking for admin user...');
    const adminResult = await query(
      `SELECT id FROM auth.users WHERE email = 'admin@cajpro.local' LIMIT 1`
    );
    
    if (adminResult.rows.length === 0) {
      console.error('Admin user not found. Creating admin user...');
      
      // Create admin user
      await query(`
        INSERT INTO auth.users (
          email, 
          password_hash, 
          salt, 
          is_admin, 
          email_confirmed_at,
          created_at,
          updated_at
        ) VALUES (
          'admin@cajpro.local',
          '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
          'developmentsalt',
          TRUE,
          NOW(),
          NOW(),
          NOW()
        ) ON CONFLICT (email) DO NOTHING
      `);
      
      // Get the newly created admin
      const newAdminResult = await query(
        `SELECT id FROM auth.users WHERE email = 'admin@cajpro.local' LIMIT 1`
      );
      
      if (newAdminResult.rows.length === 0) {
        throw new Error('Failed to create admin user');
      }
      
      console.log('Admin user created successfully');
    }
    
    // Get admin ID (either existing or newly created)
    const adminId = (await query(
      `SELECT id FROM auth.users WHERE email = 'admin@cajpro.local' LIMIT 1`
    )).rows[0].id;
    
    console.log(`Found admin user with ID: ${adminId}`);
    
    // Check if the admin has user preferences
    console.log('Checking if admin has preferences...');
    const prefsResult = await query(
      `SELECT * FROM user_preferences WHERE id = $1`,
      [adminId]
    );
    
    // If the admin doesn't have preferences, create default ones
    if (prefsResult.rows.length === 0) {
      console.log('Admin user does not have preferences set up. Creating default preferences...');
      
      // Create default preferences
      await query(`
        INSERT INTO user_preferences (
          id, theme, color_scheme, background_intensity, ui_density,
          date_format, time_format, measurement_unit, currency,
          notification_preferences, display_preferences,
          created_at, updated_at
        ) VALUES (
          $1, 'system', 'default', 'medium', 'comfortable',
          'MM/DD/YYYY', '12h', 'imperial', 'USD',
          $2, $3,
          NOW(), NOW()
        )
      `, [
        adminId, 
        JSON.stringify({
          email: true,
          push: true,
          maintenance: true,
          project_updates: true,
        }),
        JSON.stringify({
          default_project_view: 'grid',
          default_task_view: 'list',
          show_completed_tasks: true,
        })
      ]);
      
      console.log('Default preferences created for admin user.');
    } else {
      console.log('Admin user already has preferences set up.');
    }
    
    // Try to remove any invalid preferences (this might fail if strictly enforced UUIDs)
    try {
      console.log('Checking for invalid preferences with string IDs...');
      // Use string operators to avoid UUID validation
      const removeResult = await query(`
        DELETE FROM user_preferences 
        WHERE id::text IN ('admin-dev-mode', 'admin')
      `);
      
      if (removeResult.rowCount > 0) {
        console.log(`Removed ${removeResult.rowCount} invalid preferences entries.`);
      } else {
        console.log('No invalid preferences found.');
      }
    } catch (error) {
      console.log('Note: Could not check for invalid preferences (this is normal if UUID constraints are strict)');
    }
    
    console.log('Fix complete. The admin user now has valid preferences.');
    
    // Close the database connection
    await pool.end();
    console.log('Database connection closed.');
    
    process.exit(0);
  } catch (error) {
    console.error('Error running fix script:', error);
    
    try {
      // Try to close the pool
      await pool.end();
    } catch (closeError) {
      console.error('Error closing pool:', closeError);
    }
    
    process.exit(1);
  }
}

// Run the script
fixAdminDevMode();

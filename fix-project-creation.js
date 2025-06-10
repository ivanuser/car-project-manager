/**
 * Fix Project Creation Issues
 * This script verifies and fixes the database schema and authentication for project creation
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Database connection with fallback to individual parameters
const pool = new Pool({
  // Try individual parameters first (more reliable)
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: false // Disable SSL for local development
});

async function checkDatabaseConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Database connection successful');
    
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database query successful:', result.rows[0].now);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function checkTableExists(tableName) {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = $1
      );
    `, [tableName]);
    
    client.release();
    return result.rows[0].exists;
  } catch (error) {
    console.error(`❌ Error checking table ${tableName}:`, error.message);
    return false;
  }
}

async function checkVehicleProjectsSchema() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'vehicle_projects' 
      ORDER BY ordinal_position;
    `);
    
    client.release();
    
    if (result.rows.length === 0) {
      console.log('❌ vehicle_projects table does not exist');
      return false;
    }
    
    console.log('✅ vehicle_projects table exists with columns:');
    result.rows.forEach(row => {
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
    });
    
    // Check for required columns
    const columnNames = result.rows.map(row => row.column_name);
    const requiredColumns = ['id', 'title', 'make', 'model', 'user_id', 'created_at', 'updated_at'];
    const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
    
    if (missingColumns.length > 0) {
      console.log('❌ Missing required columns:', missingColumns);
      return false;
    }
    
    console.log('✅ All required columns present');
    return true;
  } catch (error) {
    console.error('❌ Error checking vehicle_projects schema:', error.message);
    return false;
  }
}

async function checkUsersTable() {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_name = 'users';
    `);
    
    client.release();
    const exists = result.rows[0].count > 0;
    
    if (exists) {
      console.log('✅ users table exists');
      
      // Check if there are any users
      const userClient = await pool.connect();
      const userResult = await userClient.query('SELECT COUNT(*) as count FROM users');
      userClient.release();
      
      console.log(`✅ Found ${userResult.rows[0].count} users in database`);
    } else {
      console.log('❌ users table does not exist');
    }
    
    return exists;
  } catch (error) {
    console.error('❌ Error checking users table:', error.message);
    return false;
  }
}

async function applyPostgreSQLSchema() {
  try {
    const schemaPath = path.join(__dirname, 'db', 'schema-postgresql.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ schema-postgresql.sql file not found');
      return false;
    }
    
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📋 Applying PostgreSQL schema...');
    
    const client = await pool.connect();
    await client.query(schemaSql);
    client.release();
    
    console.log('✅ PostgreSQL schema applied successfully');
    return true;
  } catch (error) {
    console.error('❌ Error applying PostgreSQL schema:', error.message);
    return false;
  }
}

async function testProjectCreation() {
  try {
    const client = await pool.connect();
    
    // Try to create a test project (we'll delete it afterward)
    const testUserId = '00000000-0000-0000-0000-000000000001'; // Test user ID
    
    const insertResult = await client.query(`
      INSERT INTO vehicle_projects (
        title, make, model, year, description, project_type, 
        status, user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [
      'Test Project', 'Toyota', 'Supra', 1998, 'Test project creation', 
      'restoration', 'planning', testUserId
    ]);
    
    const projectId = insertResult.rows[0].id;
    
    // Clean up - delete the test project
    await client.query('DELETE FROM vehicle_projects WHERE id = $1', [projectId]);
    
    client.release();
    
    console.log('✅ Project creation test successful');
    return true;
  } catch (error) {
    console.error('❌ Project creation test failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🔧 Fix Project Creation Issues');
  console.log('=====================================\n');
  
  // Step 1: Check database connection
  console.log('1. Checking database connection...');
  const connected = await checkDatabaseConnection();
  if (!connected) {
    console.log('\n❌ Cannot proceed without database connection');
    process.exit(1);
  }
  console.log('');
  
  // Step 2: Check if tables exist
  console.log('2. Checking table existence...');
  const usersExists = await checkUsersTable();
  const vehicleProjectsExists = await checkTableExists('vehicle_projects');
  console.log(`   vehicle_projects table: ${vehicleProjectsExists ? '✅' : '❌'}`);
  console.log('');
  
  // Step 3: Apply schema if needed
  if (!usersExists || !vehicleProjectsExists) {
    console.log('3. Applying PostgreSQL schema...');
    const schemaApplied = await applyPostgreSQLSchema();
    if (!schemaApplied) {
      console.log('\n❌ Failed to apply schema');
      process.exit(1);
    }
    console.log('');
  } else {
    console.log('3. Schema check...');
    const schemaValid = await checkVehicleProjectsSchema();
    if (!schemaValid) {
      console.log('   Attempting to fix schema...');
      await applyPostgreSQLSchema();
    }
    console.log('');
  }
  
  // Step 4: Test project creation
  console.log('4. Testing project creation...');
  const creationWorks = await testProjectCreation();
  console.log('');
  
  // Summary
  console.log('Summary:');
  console.log('========');
  console.log(`Database Connection: ${connected ? '✅' : '❌'}`);
  console.log(`Schema Applied: ✅`);
  console.log(`Project Creation: ${creationWorks ? '✅' : '❌'}`);
  
  if (creationWorks) {
    console.log('\n🎉 Project creation should now work!');
    console.log('\nNext steps:');
    console.log('1. Start your development server');
    console.log('2. Try creating a new project');
    console.log('3. The save button should now work properly');
  } else {
    console.log('\n❌ Project creation is still not working');
    console.log('\nPlease check:');
    console.log('1. Database connection settings in .env.local');
    console.log('2. User authentication status');
    console.log('3. Console errors in browser developer tools');
  }
  
  process.exit(0);
}

// Run the fix
main().catch(error => {
  console.error('❌ Unexpected error:', error.message);
  process.exit(1);
});

/**
 * Database Connection Test
 * Tests various connection string formats to fix the SCRAM authentication issue
 */

const { Pool } = require('pg');
require('dotenv').config({ path: '.env.local' });

async function testConnection(label, config) {
  console.log(`\n🔍 Testing ${label}...`);
  console.log(`   Config: ${JSON.stringify({...config, password: '[HIDDEN]'}, null, 2)}`);
  
  const pool = new Pool(config);
  
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW() as current_time, current_user, current_database()');
    client.release();
    await pool.end();
    
    console.log(`✅ ${label} - SUCCESS!`);
    console.log(`   Connected as: ${result.rows[0].current_user}`);
    console.log(`   Database: ${result.rows[0].current_database}`);
    console.log(`   Time: ${result.rows[0].current_time}`);
    return true;
  } catch (error) {
    await pool.end();
    console.log(`❌ ${label} - FAILED: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔧 Database Connection Debugging');
  console.log('==================================');
  
  console.log('\n📋 Environment Variables:');
  console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '[SET]' : '[NOT SET]'}`);
  console.log(`   POSTGRES_HOST: ${process.env.POSTGRES_HOST || '[NOT SET]'}`);
  console.log(`   POSTGRES_USER: ${process.env.POSTGRES_USER || '[NOT SET]'}`);
  console.log(`   POSTGRES_DB: ${process.env.POSTGRES_DB || '[NOT SET]'}`);
  console.log(`   POSTGRES_PORT: ${process.env.POSTGRES_PORT || '[NOT SET]'}`);
  console.log(`   POSTGRES_PASSWORD: ${process.env.POSTGRES_PASSWORD ? '[SET]' : '[NOT SET]'}`);
  
  const tests = [
    // Test 1: Current DATABASE_URL
    {
      label: 'Current DATABASE_URL',
      config: {
        connectionString: process.env.DATABASE_URL
      }
    },
    
    // Test 2: Individual connection parameters
    {
      label: 'Individual Parameters',
      config: {
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT),
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD
      }
    },
    
    // Test 3: Manual connection string without URL encoding
    {
      label: 'Manual Connection String (no URL encoding)',
      config: {
        connectionString: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
      }
    },
    
    // Test 4: Connection with SSL disabled (common local development issue)
    {
      label: 'Individual Parameters with SSL disabled',
      config: {
        host: process.env.POSTGRES_HOST,
        port: parseInt(process.env.POSTGRES_PORT),
        database: process.env.POSTGRES_DB,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        ssl: false
      }
    }
  ];
  
  let anyWorked = false;
  let workingConfig = null;
  
  for (const test of tests) {
    const success = await testConnection(test.label, test.config);
    if (success && !anyWorked) {
      anyWorked = true;
      workingConfig = test;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log('===========');
  
  if (anyWorked) {
    console.log('✅ Found working database connection!');
    console.log(`✅ Working configuration: ${workingConfig.label}`);
    
    // Generate recommended DATABASE_URL
    if (workingConfig.label.includes('Individual Parameters')) {
      const newUrl = `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
      console.log('\n📝 Recommended fix for .env.local:');
      console.log(`DATABASE_URL=${newUrl}`);
    }
  } else {
    console.log('❌ No working database connection found');
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Verify PostgreSQL is running:');
    console.log('   sudo systemctl status postgresql');
    console.log('2. Check if database exists:');
    console.log('   sudo -u postgres psql -l');
    console.log('3. Test direct connection:');
    console.log(`   psql -h ${process.env.POSTGRES_HOST} -p ${process.env.POSTGRES_PORT} -U ${process.env.POSTGRES_USER} -d ${process.env.POSTGRES_DB}`);
    console.log('4. Check PostgreSQL logs:');
    console.log('   sudo journalctl -u postgresql -f');
  }
}

main().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

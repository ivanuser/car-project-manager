const { Pool } = require('pg');
const crypto = require('crypto');

// Database configuration from environment
require('dotenv').config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
console.log('Using DATABASE_URL:', connectionString ? connectionString.replace(/:[^:@]*@/, ':***@') : 'NOT SET');

const db = new Pool({
  connectionString: connectionString
});

// Function to hash password with salt
function hashPasswordWithSalt(password, salt) {
  return crypto
    .createHmac('sha256', salt)
    .update(password)
    .digest('hex');
}

// Function to generate salt
function generateSalt(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

async function debugAdminUser() {
  console.log('=== Admin User Debug Script ===\n');
  
  try {
    // First, check if admin user exists
    console.log('1. Checking if admin user exists...');
    const userCheck = await db.query(
      `SELECT id, email, password_hash, salt, is_admin, created_at 
       FROM auth.users WHERE email = $1`,
      ['admin@cajpro.local']
    );
    
    if (userCheck.rows.length === 0) {
      console.log('❌ Admin user does NOT exist in database');
      console.log('\n2. Creating admin user...');
      
      // Create admin user with the expected hash
      const salt = generateSalt();
      const passwordHash = hashPasswordWithSalt('admin123', salt);
      
      console.log('Generated salt:', salt);
      console.log('Generated hash:', passwordHash);
      
      const insertResult = await db.query(
        `INSERT INTO auth.users (email, password_hash, salt, is_admin, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id, email, is_admin`,
        ['admin@cajpro.local', passwordHash, salt, true]
      );
      
      console.log('✅ Admin user created successfully:');
      console.log(insertResult.rows[0]);
      
    } else {
      console.log('✅ Admin user exists in database:');
      const user = userCheck.rows[0];
      console.log({
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin,
        createdAt: user.created_at,
        passwordHashLength: user.password_hash?.length || 'NULL',
        saltLength: user.salt?.length || 'NULL'
      });
      
      console.log('\n3. Checking password hash...');
      const expectedHash = '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8';
      const actualHash = user.password_hash;
      
      console.log('Expected hash:', expectedHash);
      console.log('Actual hash  :', actualHash);
      console.log('Hash match   :', expectedHash === actualHash ? '✅ YES' : '❌ NO');
      
      if (expectedHash !== actualHash) {
        console.log('\n4. Hash mismatch detected. Testing password verification...');
        
        // Test if the current hash validates correctly with the salt
        if (user.salt) {
          const testHash = hashPasswordWithSalt('admin123', user.salt);
          console.log('Computed hash:', testHash);
          console.log('Hash validates:', testHash === actualHash ? '✅ YES' : '❌ NO');
          
          if (testHash !== actualHash) {
            console.log('\n5. Password validation failed. Updating admin user password...');
            
            // Update the admin user with correct hash
            const newSalt = generateSalt();
            const newHash = hashPasswordWithSalt('admin123', newSalt);
            
            const updateResult = await db.query(
              `UPDATE auth.users 
               SET password_hash = $1, salt = $2, updated_at = NOW()
               WHERE email = $3
               RETURNING id, email`,
              [newHash, newSalt, 'admin@cajpro.local']
            );
            
            console.log('✅ Admin user password updated successfully:');
            console.log(updateResult.rows[0]);
            console.log('New hash:', newHash);
          }
        } else {
          console.log('❌ No salt found for user - this is a problem');
        }
      }
    }
    
    console.log('\n6. Final verification - testing login...');
    const finalCheck = await db.query(
      `SELECT id, email, password_hash, salt, is_admin 
       FROM auth.users WHERE email = $1`,
      ['admin@cajpro.local']
    );
    
    if (finalCheck.rows.length > 0) {
      const user = finalCheck.rows[0];
      const computedHash = hashPasswordWithSalt('admin123', user.salt);
      const loginWillWork = computedHash === user.password_hash;
      
      console.log('Login test result:', loginWillWork ? '✅ LOGIN SHOULD WORK' : '❌ LOGIN WILL FAIL');
      
      if (!loginWillWork) {
        console.log('Expected:', computedHash);
        console.log('Actual  :', user.password_hash);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  } finally {
    await db.end();
  }
}

// Run the debug script
debugAdminUser().then(() => {
  console.log('\n=== Debug script completed ===');
}).catch(error => {
  console.error('Script failed:', error);
  process.exit(1);
});

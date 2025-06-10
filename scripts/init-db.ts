/**
 * init-db.ts - Initialize PostgreSQL database with schemas
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { getPgConfig } from '@/lib/auth/db-config';

async function initDatabase() {
  console.log('Initializing database...');
  
  // Get database connection string from environment variables
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is missing');
  }
  
  // Create database connection
  const pgConfig = getPgConfig(connectionString);
  const pool = new Pool(pgConfig);
  
  try {
    // Check if database connection works
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');
    
    // Enable UUID extension if not already enabled
    console.log('Ensuring uuid-ossp extension is enabled...');
    await pool.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');
    
    // Read schema files
    const schemasDir = path.join(process.cwd(), 'db');
    const schemaFiles = [
      'auth-schema.sql',
      // Add other schema files here
    ];
    
    // Execute schema files
    for (const file of schemaFiles) {
      const schemaPath = path.join(schemasDir, file);
      
      try {
        // Check if file exists
        if (!fs.existsSync(schemaPath)) {
          console.error(`Schema file not found: ${schemaPath}`);
          continue;
        }
        
        console.log(`Executing schema file: ${file}`);
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        // Execute schema
        await pool.query(schema);
        console.log(`Successfully executed schema: ${file}`);
      } catch (error) {
        console.error(`Error executing schema file ${file}:`, error);
        throw error;
      }
    }
    
    // Create admin user if init flag is set
    if (process.env.INITIALIZE_DB === 'true') {
      console.log('Creating admin user...');
      await pool.query('SELECT auth.seed_admin_user();');
      console.log('Admin user created or already exists');
    }
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    // Close database connection
    await pool.end();
  }
}

// Check if executed directly
if (require.main === module) {
  // Load environment variables if not already loaded
  require('dotenv').config();
  
  // Run database initialization
  initDatabase()
    .then(() => {
      console.log('Database initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization script failed:', error);
      process.exit(1);
    });
} else {
  // Export function for importing
  module.exports = { initDatabase };
}

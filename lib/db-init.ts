/**
 * db-init.ts - Database initialization on application startup
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import 'server-only';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { getPgConfig } from '@/lib/auth/db-config';

let initialized = false;

/**
 * Initialize database on application startup
 */
export async function initializeDatabase() {
  // Only initialize once
  if (initialized) {
    return;
  }
  
  // Only initialize if environment variable is set
  if (process.env.INITIALIZE_DB !== 'true') {
    console.log('Database initialization skipped (INITIALIZE_DB is not set to true)');
    initialized = true;
    return;
  }
  
  console.log('Initializing database on startup...');
  
  // Get database connection string from environment variables
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is missing');
    return;
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
    
    // Check if auth schema already exists
    const schemaResult = await pool.query(`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'auth'
    `);
    
    const schemaExists = schemaResult.rows.length > 0;
    
    if (schemaExists) {
      console.log('Auth schema already exists, skipping schema creation');
    } else {
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
          // Log error but continue - this allows initialization to proceed
          // even if some statements fail (like when objects already exist)
          console.error(`Error executing schema file ${file}:`, error);
          console.log('Continuing with initialization despite errors...');
        }
      }
    }
    
    // Create admin user if init flag is set
    console.log('Creating admin user...');
    try {
      await pool.query('SELECT auth.seed_admin_user();');
      console.log('Admin user created or already exists');
    } catch (error) {
      console.error('Error creating admin user:', error);
    }
    
    console.log('Database initialization completed successfully!');
    initialized = true;
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    // Close database connection
    await pool.end();
  }
}

export default { initializeDatabase };

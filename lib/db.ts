/**
 * db.ts - PostgreSQL database connection
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { Pool } from 'pg';
import { getPgConfig } from '@/lib/auth/db-config';

// Singleton pool instance
let pool: Pool;

/**
 * Initialize database connection pool
 */
export const initPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Get environment-specific configuration
    const pgConfig = getPgConfig(connectionString);
    
    // Create pool with config
    pool = new Pool(pgConfig);
    
    // Log when the pool establishes a new connection
    pool.on('connect', () => {
      console.log('PostgreSQL pool connection established');
    });
    
    // Log errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
    });
  }
  
  return pool;
};

/**
 * Execute database query
 * @param text - SQL query
 * @param params - Query parameters
 * @returns Query result
 */
export const query = async (text: string, params: any[] = []) => {
  if (!pool) {
    initPool();
  }
  
  const start = Date.now();
  
  try {
    console.log('Executing query:', text);
    console.log('Query parameters:', params);
    
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    console.log('Query result:', { rowCount: result.rowCount, duration });
    
    // Log slow queries for debugging (>100ms)
    if (duration > 100) {
      console.log('Slow query:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (error) {
    console.error('Query error:', { text, params, error });
    throw error;
  }
};

/**
 * Execute transaction
 * @param callback - Transaction callback
 * @returns Transaction result
 */
export const transaction = async (callback: (client: any) => Promise<any>) => {
  if (!pool) {
    initPool();
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Get current user ID from cookie/session
 * To be implemented with JWT validation
 */
export const getCurrentUserId = async () => {
  // This is a placeholder; implement proper session validation
  return null;
};

// Export functions
export default {
  initPool,
  query,
  transaction,
  getCurrentUserId,
};

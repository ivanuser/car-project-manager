/**
 * db.ts - PostgreSQL database connection for authentication
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { Pool, PoolClient } from 'pg';
import { getPgConfig } from './db-config';

// Initialize connection pool
let pool: Pool;

// Initialize the database connection pool
export const initPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    try {
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
        // Don't exit process on error in development, just log it
        if (process.env.NODE_ENV === 'production') {
          process.exit(-1);
        }
      });
    } catch (error) {
      console.error('Failed to initialize PostgreSQL pool:', error);
      throw error;
    }
  }
  
  return pool;
};

// Get a client from the pool
export const getClient = async (): Promise<PoolClient> => {
  if (!pool) {
    initPool();
  }
  
  return await pool.connect();
};

// Execute a query using a single connection from the pool
export const query = async (text: string, params: any[] = []) => {
  if (!pool) {
    initPool();
  }
  
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
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

// Execute a transaction
export const transaction = async (callback: (client: PoolClient) => Promise<any>) => {
  const client = await getClient();
  
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

// Close all pool connections (for use in tests or on server shutdown)
export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = undefined as any;
    console.log('PostgreSQL pool connections closed');
  }
};

// Server-side only database module - to avoid client-side imports
export const isServer = () => typeof window === 'undefined';

// Empty fallback for client-side
const clientSideFallback = {
  query: async () => { throw new Error('Database not available on client-side'); },
  getClient: async () => { throw new Error('Database not available on client-side'); },
  transaction: async () => { throw new Error('Database not available on client-side'); },
  initPool: () => { throw new Error('Database not available on client-side'); },
  closePool: async () => { /* no-op */ },
};

// Export server-side methods or client-side fallbacks
export default isServer() 
  ? { initPool, getClient, query, transaction, closePool }
  : clientSideFallback;

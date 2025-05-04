/**
 * db.ts - PostgreSQL database connection for authentication
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

import { Pool, PoolClient } from 'pg';

// Initialize connection pool
let pool: Pool;

// Initialize the database connection pool
export const initPool = () => {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    pool = new Pool({
      connectionString,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // How long a client is allowed to remain idle before being closed
      connectionTimeoutMillis: 2000, // How long to wait for a connection to become available
    });
    
    // Log when the pool establishes a new connection
    pool.on('connect', () => {
      console.log('PostgreSQL pool connection established');
    });
    
    // Log errors
    pool.on('error', (err) => {
      console.error('Unexpected error on idle PostgreSQL client', err);
      process.exit(-1);
    });
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
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  
  // Log slow queries for debugging (>100ms)
  if (duration > 100) {
    console.log('Slow query:', { text, duration, rows: result.rowCount });
  }
  
  return result;
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

export default {
  initPool,
  getClient,
  query,
  transaction,
  closePool
};

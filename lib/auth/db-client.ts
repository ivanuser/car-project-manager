/**
 * db-client.ts - Client-side mock for database operations
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

// This file provides mock implementations of database functions for client-side code.
// It prevents the pg module from being imported on the client side, which would
// cause issues with Next.js bundling and Cloudflare integration.

// Mock PoolClient interface for type compatibility
export interface MockPoolClient {
  query: (text: string, params?: any[]) => Promise<any>;
  release: () => void;
}

// Mock query result for type compatibility
export interface MockQueryResult {
  rows: any[];
  rowCount: number;
  command: string;
  oid: number;
  fields: any[];
}

/**
 * Mock query function that always throws an error when called on client side
 */
export const query = async (text: string, params: any[] = []): Promise<MockQueryResult> => {
  console.error('Attempted to use database query on client side');
  throw new Error('Database operations are not available on client side');
};

/**
 * Mock getClient function that always throws an error when called on client side
 */
export const getClient = async (): Promise<MockPoolClient> => {
  console.error('Attempted to use database client on client side');
  throw new Error('Database operations are not available on client side');
};

/**
 * Mock transaction function that always throws an error when called on client side
 */
export const transaction = async (callback: (client: MockPoolClient) => Promise<any>): Promise<any> => {
  console.error('Attempted to use database transaction on client side');
  throw new Error('Database operations are not available on client side');
};

/**
 * Mock initPool function that always throws an error when called on client side
 */
export const initPool = (): void => {
  console.error('Attempted to initialize database pool on client side');
  throw new Error('Database operations are not available on client side');
};

/**
 * Mock closePool function that does nothing when called on client side
 */
export const closePool = async (): Promise<void> => {
  // No-op
};

// Export client-side mocks
export default {
  query,
  getClient,
  transaction,
  initPool,
  closePool,
};

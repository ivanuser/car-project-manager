/**
 * db-client.ts - Client-side mock for database operations
 * For Caj-pro car project build tracking application
 * Created on: May 4, 2025
 */

// This file provides empty implementations of database functions for client-side code.
// It prevents the pg module from being imported on the client side.

// Mock query function that throws an error
export const query = async () => {
  throw new Error('Database operations are not available on client side');
};

// Mock getClient function that throws an error
export const getClient = async () => {
  throw new Error('Database operations are not available on client side');
};

// Mock transaction function that throws an error
export const transaction = async () => {
  throw new Error('Database operations are not available on client side');
};

// Mock initPool function that throws an error
export const initPool = () => {
  throw new Error('Database operations are not available on client side');
};

// Mock closePool function that does nothing
export const closePool = async () => {
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

/**
 * db-config.ts - PostgreSQL configuration with Cloudflare compatibility
 * For Caj-pro car project build tracking application
 * Created on: May 5, 2025
 */

import { PoolConfig } from 'pg';

// Define special configuration options for different environments
interface EnvOptions {
  ssl?: boolean | {
    rejectUnauthorized?: boolean;
  };
  native?: boolean;
}

/**
 * Alternative method to get connection parameters from environment variables
 * This avoids URL parsing issues with special characters in passwords
 */
const getDirectConnectionParams = (): PoolConfig => {
  console.log('Environment variables for database connection:');
  console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST || 'localhost');
  console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT || '5432');
  console.log('POSTGRES_DB:', process.env.POSTGRES_DB || 'cajpro');
  console.log('POSTGRES_USER:', process.env.POSTGRES_USER || 'cajpro');
  console.log('DATABASE_URL:', process.env.DATABASE_URL || 'Not set');
  
  return {
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'cajpro',
    user: process.env.POSTGRES_USER || 'cajpro',
    password: process.env.POSTGRES_PASSWORD || '',
  };
};

/**
 * Get PostgreSQL configuration with environment-specific settings
 */
export const getPgConfig = (connectionString: string): PoolConfig => {
  const isCloudflare = typeof process.env.NEXT_PUBLIC_CLOUDFLARE_TUNNEL !== 'undefined' && 
                       process.env.NEXT_PUBLIC_CLOUDFLARE_TUNNEL === 'true';
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Default configuration
  let config: PoolConfig & EnvOptions;
  
  // Try to use direct connection parameters first if they're all available
  if (process.env.POSTGRES_HOST && 
      process.env.POSTGRES_USER && 
      process.env.POSTGRES_PASSWORD && 
      process.env.POSTGRES_DB) {
    console.log('Using direct connection parameters instead of connection string');
    config = {
      ...getDirectConnectionParams(),
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      native: false, // Disable native bindings to avoid pg-native dependency
    };
  } else {
    // Fall back to connection string
    console.log('Using connection string for database connection');
    config = {
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      native: false, // Disable native bindings to avoid pg-native dependency
    };
  }
  
  // Production settings
  if (isProduction) {
    config.ssl = {
      rejectUnauthorized: false // Allow self-signed certificates in production
    };
  }
  
  // Cloudflare tunnel settings
  if (isCloudflare && connectionString) {
    console.log('Configuring for Cloudflare tunnel environment');
    // When running in Cloudflare environment, set special options
    config.ssl = false; // Disable SSL for local connection through tunnel
    
    // Extract individual connection parameters from the connection string
    try {
      const url = new URL(connectionString);
      // Override the config with individual parameters if using connection string
      if (config.connectionString) {
        Object.assign(config, {
          host: url.hostname,
          port: parseInt(url.port) || 5432,
          database: url.pathname.slice(1), // Remove leading /
          user: url.username,
          password: decodeURIComponent(url.password), // Decode URL-encoded password
          connectionString: undefined, // Clear connection string to use individual params
        });
      }
    } catch (error) {
      console.error('Failed to parse connection string:', error);
      console.log('Falling back to direct connection parameters');
      Object.assign(config, getDirectConnectionParams());
      config.connectionString = undefined;
    }
  }
  
  // Log config for debugging (without password)
  const debugConfig = { ...config };
  delete debugConfig.password;
  console.log('PostgreSQL configuration:', debugConfig);
  
  return config;
};

export default { getPgConfig };

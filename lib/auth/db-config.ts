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
 * Get PostgreSQL configuration with environment-specific settings
 */
export const getPgConfig = (connectionString: string): PoolConfig => {
  const isCloudflare = typeof process.env.NEXT_PUBLIC_CLOUDFLARE_TUNNEL !== 'undefined' && 
                       process.env.NEXT_PUBLIC_CLOUDFLARE_TUNNEL === 'true';
  
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Default configuration
  const config: PoolConfig & EnvOptions = {
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    native: false, // Disable native bindings to avoid pg-native dependency
  };
  
  // Production settings
  if (isProduction) {
    config.ssl = {
      rejectUnauthorized: false // Allow self-signed certificates in production
    };
  }
  
  // Cloudflare tunnel settings
  if (isCloudflare) {
    // When running in Cloudflare environment, set special options
    config.ssl = false; // Disable SSL for local connection through tunnel
    
    // Extract individual connection parameters from the connection string
    try {
      const url = new URL(connectionString);
      // Override the config with individual parameters
      Object.assign(config, {
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        database: url.pathname.slice(1), // Remove leading /
        user: url.username,
        password: url.password,
        connectionString: undefined, // Clear connection string to use individual params
      });
    } catch (error) {
      console.error('Failed to parse connection string:', error);
    }
  }
  
  return config;
};

export default { getPgConfig };

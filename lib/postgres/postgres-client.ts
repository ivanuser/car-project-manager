/**
 * postgres-client.ts - Direct PostgreSQL client
 * For Caj-pro car project build tracking application
 * Created on: May 18, 2025
 * 
 * This client provides a Supabase-compatible API that works directly with PostgreSQL.
 * It is used as a compatibility layer to facilitate the migration away from Supabase
 * while maintaining the same API surface to minimize changes to the application code.
 * 
 * IMPORTANT: This is a transitional solution. Eventually, all Supabase-style query patterns
 * should be replaced with direct SQL queries using the query() function from lib/db.ts.
 */

import { query, transaction } from '@/lib/db';

/**
 * PostgreSQL client with methods similar to Supabase
 * for compatibility during the transition period
 */
class PostgresClient {
  /**
   * Constructor
   */
  constructor() {
    // Nothing to initialize
  }

  /**
   * Query a specific table
   * @param tableName - Name of the table to query
   * @returns Query builder object
   */
  from(tableName: string) {
    return new QueryBuilder(tableName);
  }

  /**
   * Get storage operations
   * @param bucketName - Name of the storage bucket
   * @returns Storage operations object
   */
  storage = {
    from: (bucketName: string) => {
      return {
        /**
         * Upload a file to storage
         * @param path - File path
         * @param file - File to upload
         * @returns Upload result
         */
        upload: async (path: string, file: File) => {
          // Not implemented - should use direct file system operations or S3-compatible service
          console.error('Storage operations are not implemented, use direct file system operations');
          return {
            data: null,
            error: new Error('Storage operations not implemented'),
          };
        },

        /**
         * Get a public URL for a file
         * @param path - File path
         * @returns Public URL
         */
        getPublicUrl: (path: string) => {
          // Not implemented - should return URL to static file
          return {
            data: {
              publicUrl: `/api/storage/${bucketName}/${path}`,
            },
          };
        },
      };
    },
  };

  /**
   * Authentication operations
   */
  auth = {
    /**
     * Get the current session
     * @returns Session data
     */
    getSession: async () => {
      try {
        // Call the API endpoint to get user information
        const response = await fetch('/api/auth/user', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          return { data: { session: null } };
        }

        const data = await response.json();
        
        return {
          data: {
            session: data.user ? { user: data.user } : null,
          },
        };
      } catch (error) {
        console.error('Error getting session:', error);
        return { data: { session: null } };
      }
    },
  };
}

/**
 * Query builder for PostgreSQL
 */
class QueryBuilder {
  private tableName: string;
  private selectColumns: string = '*';
  private conditions: { column: string; operator: string; value: any }[] = [];
  private orderByColumns: { column: string; ascending: boolean }[] = [];
  private limitValue: number | null = null;
  private offsetValue: number | null = null;
  private returningValue: boolean = false;

  /**
   * Constructor
   * @param tableName - Table name to query
   */
  constructor(tableName: string) {
    this.tableName = tableName;
  }

  /**
   * Select specific columns
   * @param columns - Columns to select
   * @returns Query builder instance
   */
  select(columns: string = '*') {
    this.selectColumns = columns;
    return this;
  }

  /**
   * Add a filter condition (equals)
   * @param column - Column name
   * @param value - Value to compare
   * @returns Query builder instance
   */
  eq(column: string, value: any) {
    this.conditions.push({ column, operator: '=', value });
    return this;
  }

  /**
   * Add a filter condition (greater than or equal)
   * @param column - Column name
   * @param value - Value to compare
   * @returns Query builder instance
   */
  gte(column: string, value: any) {
    this.conditions.push({ column, operator: '>=', value });
    return this;
  }

  /**
   * Add a filter condition (less than or equal)
   * @param column - Column name
   * @param value - Value to compare
   * @returns Query builder instance
   */
  lte(column: string, value: any) {
    this.conditions.push({ column, operator: '<=', value });
    return this;
  }

  /**
   * Set the order by clause
   * @param column - Column to order by
   * @param options - Order options
   * @returns Query builder instance
   */
  order(column: string, options: { ascending: boolean }) {
    this.orderByColumns.push({ column, ascending: options.ascending });
    return this;
  }

  /**
   * Set the limit clause
   * @param limit - Limit value
   * @returns Query builder instance
   */
  limit(limit: number) {
    this.limitValue = limit;
    return this;
  }

  /**
   * Set the offset clause
   * @param offset - Offset value
   * @returns Query builder instance
   */
  offset(offset: number) {
    this.offsetValue = offset;
    return this;
  }

  /**
   * Indicate that query should return data
   * @returns Query builder instance
   */
  returning() {
    this.returningValue = true;
    return this;
  }

  /**
   * Execute select query and expect a single row
   * @returns Query result
   */
  async single() {
    try {
      // Build the query
      let sql = `SELECT ${this.selectColumns} FROM ${this.tableName}`;
      const params: any[] = [];

      // Add WHERE clause
      if (this.conditions.length > 0) {
        sql += ' WHERE ';
        const whereConditions = this.conditions.map((condition, index) => {
          params.push(condition.value);
          return `${condition.column} ${condition.operator} $${params.length}`;
        });
        sql += whereConditions.join(' AND ');
      }

      // Add ORDER BY clause
      if (this.orderByColumns.length > 0) {
        sql += ' ORDER BY ';
        const orderClauses = this.orderByColumns.map((order) => {
          return `${order.column} ${order.ascending ? 'ASC' : 'DESC'}`;
        });
        sql += orderClauses.join(', ');
      }

      // Add LIMIT clause - for single, we limit to 1
      sql += ' LIMIT 1';

      // Execute the query
      const result = await query(sql, params);

      // Return result in Supabase-compatible format
      if (result.rows.length === 0) {
        return {
          data: null,
          error: {
            message: 'No rows found',
            code: 'PGRST116',
          },
        };
      }

      return {
        data: result.rows[0],
        error: null,
      };
    } catch (error: any) {
      console.error('PostgreSQL error:', error);
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }
  }

  /**
   * Execute select query
   * @returns Query result
   */
  async execute() {
    try {
      // Build the query
      let sql = `SELECT ${this.selectColumns} FROM ${this.tableName}`;
      const params: any[] = [];

      // Add WHERE clause
      if (this.conditions.length > 0) {
        sql += ' WHERE ';
        const whereConditions = this.conditions.map((condition, index) => {
          params.push(condition.value);
          return `${condition.column} ${condition.operator} $${params.length}`;
        });
        sql += whereConditions.join(' AND ');
      }

      // Add ORDER BY clause
      if (this.orderByColumns.length > 0) {
        sql += ' ORDER BY ';
        const orderClauses = this.orderByColumns.map((order) => {
          return `${order.column} ${order.ascending ? 'ASC' : 'DESC'}`;
        });
        sql += orderClauses.join(', ');
      }

      // Add LIMIT clause
      if (this.limitValue !== null) {
        sql += ` LIMIT ${this.limitValue}`;
      }

      // Add OFFSET clause
      if (this.offsetValue !== null) {
        sql += ` OFFSET ${this.offsetValue}`;
      }

      // Execute the query
      const result = await query(sql, params);

      // Return result in Supabase-compatible format
      return {
        data: result.rows,
        error: null,
      };
    } catch (error: any) {
      console.error('PostgreSQL error:', error);
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }
  }

  /**
   * Insert data into the table
   * @param data - Data to insert
   * @returns Insert result
   */
  async insert(data: any) {
    try {
      // Extract columns and values
      const columns = Object.keys(data);
      const values = Object.values(data);
      
      // Build the query
      let sql = `INSERT INTO ${this.tableName} (${columns.join(', ')})`;
      
      // Build VALUES clause
      const placeholders = values.map((_, index) => `$${index + 1}`);
      sql += ` VALUES (${placeholders.join(', ')})`;
      
      // Add RETURNING clause if needed
      if (this.returningValue || this.selectColumns !== '*') {
        sql += ` RETURNING ${this.selectColumns}`;
      }
      
      // Execute the query
      const result = await query(sql, values);
      
      // Return result in Supabase-compatible format
      return {
        data: this.returningValue ? result.rows : null,
        error: null,
      };
    } catch (error: any) {
      console.error('PostgreSQL error:', error);
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }
  }

  /**
   * Update data in the table
   * @param data - Data to update
   * @returns Update result
   */
  async update(data: any) {
    try {
      // Extract columns and values for SET clause
      const columns = Object.keys(data);
      const values = Object.values(data);
      
      // Build the SET clause
      const setClauses = columns.map((column, index) => `${column} = $${index + 1}`);
      
      // Build the query
      let sql = `UPDATE ${this.tableName} SET ${setClauses.join(', ')}`;
      
      // Add WHERE clause
      if (this.conditions.length > 0) {
        sql += ' WHERE ';
        const whereConditions = this.conditions.map((condition, index) => {
          values.push(condition.value);
          return `${condition.column} ${condition.operator} $${values.length}`;
        });
        sql += whereConditions.join(' AND ');
      }
      
      // Add RETURNING clause if needed
      if (this.returningValue || this.selectColumns !== '*') {
        sql += ` RETURNING ${this.selectColumns}`;
      }
      
      // Execute the query
      const result = await query(sql, values);
      
      // Return result in Supabase-compatible format
      return {
        data: this.returningValue ? result.rows : null,
        error: null,
      };
    } catch (error: any) {
      console.error('PostgreSQL error:', error);
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }
  }

  /**
   * Delete data from the table
   * @returns Delete result
   */
  async delete() {
    try {
      // Build the query
      let sql = `DELETE FROM ${this.tableName}`;
      const params: any[] = [];
      
      // Add WHERE clause
      if (this.conditions.length > 0) {
        sql += ' WHERE ';
        const whereConditions = this.conditions.map((condition, index) => {
          params.push(condition.value);
          return `${condition.column} ${condition.operator} $${params.length}`;
        });
        sql += whereConditions.join(' AND ');
      }
      
      // Add RETURNING clause if needed
      if (this.returningValue || this.selectColumns !== '*') {
        sql += ` RETURNING ${this.selectColumns}`;
      }
      
      // Execute the query
      const result = await query(sql, params);
      
      // Return result in Supabase-compatible format
      return {
        data: this.returningValue ? result.rows : null,
        error: null,
      };
    } catch (error: any) {
      console.error('PostgreSQL error:', error);
      return {
        data: null,
        error: {
          message: error.message,
          code: error.code,
        },
      };
    }
  }
}

/**
 * Create a new PostgreSQL client
 * @returns PostgreSQL client
 */
export async function createPostgresClient() {
  return new PostgresClient();
}

export default {
  createPostgresClient,
};
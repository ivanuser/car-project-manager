import db from "@/lib/db"
import { readFile } from "fs/promises"
import { join } from "path"

export async function initializeDatabase() {
  try {
    console.log("Initializing CAJ-Pro database with PostgreSQL-only schema...")
    
    // Read the complete PostgreSQL schema file
    const schemaPath = join(process.cwd(), 'db', 'schema-postgresql.sql')
    const schemaSQL = await readFile(schemaPath, 'utf-8')
    
    console.log("Executing database schema...")
    
    // Execute the complete schema in one transaction
    await db.query('BEGIN')
    
    try {
      // Execute the schema
      await db.query(schemaSQL)
      
      // Commit the transaction
      await db.query('COMMIT')
      
      console.log("Database schema initialized successfully")
      
      // Create default admin user
      await createDefaultAdminUser()
      
      // Verify tables were created
      const result = await db.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `)
      
      console.log(`Created ${result.rows.length} tables:`, result.rows.map(r => r.table_name).join(', '))
      
      return { 
        success: true, 
        message: `Database initialized successfully with ${result.rows.length} tables`,
        tables: result.rows.map(r => r.table_name)
      }
    } catch (error) {
      // Rollback on error
      await db.query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    }
  }
}

export async function createDefaultAdminUser() {
  try {
    // Import auth service dynamically to avoid circular dependencies
    const authService = (await import('@/lib/auth/auth-service')).default
    await authService.createDefaultAdminUser()
    console.log("Default admin user check completed")
  } catch (error) {
    console.error("Error creating default admin user:", error)
    // Don't fail the entire initialization for this
  }
}

export async function checkDatabaseStatus() {
  try {
    // Check if database is connected
    await db.query('SELECT NOW()')
    
    // Check if main tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      AND table_name IN ('users', 'profiles', 'vehicle_projects', 'project_tasks', 'vendors', 'project_parts', 'sessions')
      ORDER BY table_name
    `)
    
    const expectedTables = ['users', 'profiles', 'vehicle_projects', 'project_tasks', 'vendors', 'project_parts', 'sessions']
    const existingTables = tablesResult.rows.map(r => r.table_name)
    const missingTables = expectedTables.filter(table => !existingTables.includes(table))
    
    const isInitialized = missingTables.length === 0
    
    // If initialized, check if we have any users
    let userCount = 0
    if (isInitialized) {
      const userResult = await db.query('SELECT COUNT(*) as count FROM users')
      userCount = parseInt(userResult.rows[0].count)
    }
    
    return {
      connected: true,
      initialized: isInitialized,
      tablesExist: existingTables.length,
      missingTables,
      userCount,
      tables: existingTables
    }
  } catch (error) {
    console.error("Error checking database status:", error)
    return {
      connected: false,
      initialized: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }
  }
}

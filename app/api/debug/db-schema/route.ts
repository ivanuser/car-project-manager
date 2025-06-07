import { NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET() {
  try {
    console.log("=== Database Debug Information ===")
    
    // Test basic connection
    console.log("Testing database connection...")
    const connectionTest = await db.query("SELECT NOW() as current_time, version() as postgres_version")
    console.log("✓ Database connection successful")
    console.log("PostgreSQL Version:", connectionTest.rows[0].postgres_version)
    console.log("Current Time:", connectionTest.rows[0].current_time)
    
    // Check if UUID extension is enabled
    console.log("\nChecking UUID extension...")
    const uuidTest = await db.query("SELECT uuid_generate_v4() as test_uuid")
    console.log("✓ UUID extension working:", uuidTest.rows[0].test_uuid)
    
    // List all tables
    console.log("\nListing all tables...")
    const tablesResult = await db.query(`
      SELECT 
        table_name,
        table_type,
        table_schema
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    console.log(`Found ${tablesResult.rows.length} tables:`)
    tablesResult.rows.forEach(table => {
      console.log(`  - ${table.table_name} (${table.table_type})`)
    })
    
    // Check specific tables and their columns
    const criticalTables = ['users', 'profiles', 'vehicle_projects', 'project_tasks', 'vendors', 'project_parts']
    const tableDetails = {}
    
    for (const tableName of criticalTables) {
      console.log(`\nChecking table: ${tableName}`)
      try {
        const tableExists = await db.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          ) as exists
        `, [tableName])
        
        if (tableExists.rows[0].exists) {
          // Get column information
          const columnsResult = await db.query(`
            SELECT 
              column_name,
              data_type,
              is_nullable,
              column_default
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = $1
            ORDER BY ordinal_position
          `, [tableName])
          
          // Get row count
          const countResult = await db.query(`SELECT COUNT(*) as count FROM ${tableName}`)
          
          tableDetails[tableName] = {
            exists: true,
            columns: columnsResult.rows,
            rowCount: parseInt(countResult.rows[0].count)
          }
          
          console.log(`  ✓ Table exists with ${columnsResult.rows.length} columns and ${countResult.rows[0].count} rows`)
          console.log(`  Columns: ${columnsResult.rows.map(c => c.column_name).join(', ')}`)
        } else {
          tableDetails[tableName] = {
            exists: false,
            columns: [],
            rowCount: 0
          }
          console.log(`  ✗ Table does not exist`)
        }
      } catch (error) {
        console.error(`  ✗ Error checking table ${tableName}:`, error)
        tableDetails[tableName] = {
          exists: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      }
    }
    
    // Check indexes
    console.log("\nChecking indexes...")
    const indexesResult = await db.query(`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname
    `)
    
    console.log(`Found ${indexesResult.rows.length} indexes`)
    
    // Check for any database errors or warnings
    console.log("\nChecking for database issues...")
    const issues = []
    
    // Check for missing critical tables
    const missingTables = criticalTables.filter(table => !tableDetails[table]?.exists)
    if (missingTables.length > 0) {
      issues.push(`Missing critical tables: ${missingTables.join(', ')}`)
    }
    
    // Check for empty critical tables (except for new installations)
    const emptyTables = criticalTables.filter(table => 
      tableDetails[table]?.exists && tableDetails[table]?.rowCount === 0 && table === 'users'
    )
    if (emptyTables.length > 0) {
      issues.push(`Empty critical tables: ${emptyTables.join(', ')} (no users found)`)
    }
    
    console.log("=== Debug Complete ===")
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        version: connectionTest.rows[0].postgres_version,
        currentTime: connectionTest.rows[0].current_time,
      },
      tables: {
        total: tablesResult.rows.length,
        list: tablesResult.rows.map(t => t.table_name),
        details: tableDetails,
      },
      indexes: {
        total: indexesResult.rows.length,
        list: indexesResult.rows,
      },
      issues: issues.length > 0 ? issues : null,
      recommendations: issues.length > 0 ? [
        "Run database initialization: GET /api/init-db",
        "Check database schema files in /db/ directory",
        "Verify PostgreSQL connection settings"
      ] : [
        "Database appears to be properly configured",
        "All critical tables exist",
        "Ready for application use"
      ]
    })
    
  } catch (error) {
    console.error("Database debug error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database debug failed",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST() {
  try {
    // Test if maintenance tables exist and basic functionality works
    const tests = []
    
    // Test 1: Check if maintenance_schedules table exists
    try {
      const result = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'maintenance_schedules'
        ORDER BY ordinal_position
      `)
      
      tests.push({
        test: "maintenance_schedules table structure",
        status: "success",
        details: `Found ${result.rows.length} columns`,
        columns: result.rows.map(row => `${row.column_name} (${row.data_type})`)
      })
    } catch (error) {
      tests.push({
        test: "maintenance_schedules table structure",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 2: Check if maintenance_logs table exists
    try {
      const result = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'maintenance_logs'
        ORDER BY ordinal_position
      `)
      
      tests.push({
        test: "maintenance_logs table structure",
        status: "success",
        details: `Found ${result.rows.length} columns`,
        columns: result.rows.map(row => `${row.column_name} (${row.data_type})`)
      })
    } catch (error) {
      tests.push({
        test: "maintenance_logs table structure",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 3: Check if maintenance_notifications table exists
    try {
      const result = await db.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'maintenance_notifications'
        ORDER BY ordinal_position
      `)
      
      tests.push({
        test: "maintenance_notifications table structure",
        status: "success",
        details: `Found ${result.rows.length} columns`,
        columns: result.rows.map(row => `${row.column_name} (${row.data_type})`)
      })
    } catch (error) {
      tests.push({
        test: "maintenance_notifications table structure",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 4: Check update_maintenance_schedule_status function
    try {
      const result = await db.query(`
        SELECT routine_name, routine_type 
        FROM information_schema.routines 
        WHERE routine_name = 'update_maintenance_schedule_status'
      `)
      
      tests.push({
        test: "update_maintenance_schedule_status function",
        status: result.rows.length > 0 ? "success" : "missing",
        details: result.rows.length > 0 ? "Function exists" : "Function not found"
      })
    } catch (error) {
      tests.push({
        test: "update_maintenance_schedule_status function",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    // Test 5: Test basic query functionality
    try {
      const result = await db.query(`
        SELECT COUNT(*) as count FROM maintenance_schedules
      `)
      
      tests.push({
        test: "maintenance_schedules query test",
        status: "success",
        details: `Found ${result.rows[0].count} maintenance schedules`
      })
    } catch (error) {
      tests.push({
        test: "maintenance_schedules query test",
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      })
    }

    const allSuccessful = tests.every(test => test.status === "success")

    return NextResponse.json({
      success: allSuccessful,
      message: allSuccessful 
        ? "All maintenance database tests passed!" 
        : "Some maintenance database tests failed",
      tests,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error("Error testing maintenance database:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to test maintenance database"
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Maintenance Database Test API",
    description: "POST to this endpoint to test maintenance database functionality",
    endpoints: {
      test: "POST /api/test-maintenance-db - Run maintenance database tests"
    }
  })
}

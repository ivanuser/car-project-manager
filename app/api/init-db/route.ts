import { NextResponse } from "next/server"
import { initializeDatabase, checkDatabaseStatus, createDefaultUser } from "@/lib/init-db"

export async function GET() {
  try {
    // First check current database status
    const status = await checkDatabaseStatus()
    
    if (!status.connected) {
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
          details: status.error,
        },
        { status: 500 },
      )
    }
    
    // If already initialized, return status
    if (status.initialized) {
      return NextResponse.json({
        success: true,
        message: "Database already initialized",
        status,
      })
    }
    
    // Initialize the database schema
    console.log("Starting database initialization...")
    const result = await initializeDatabase()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Database initialization failed",
          details: result.error,
        },
        { status: 500 },
      )
    }
    
    // Create default user
    console.log("Creating default user...")
    const userResult = await createDefaultUser()
    
    if (!userResult.success) {
      console.error("Failed to create default user:", userResult.error)
      // Don't fail the entire initialization for this
    }
    
    // Get final status
    const finalStatus = await checkDatabaseStatus()

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      initialization: result,
      defaultUser: userResult,
      status: finalStatus,
    })
  } catch (error) {
    console.error("Error in init-db route:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Unexpected error during database initialization",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  // Allow POST requests to force re-initialization
  return GET()
}

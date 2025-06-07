// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/init-db"

export async function GET() {
  try {
    console.log("Initializing database tables directly...")
    
    // Use our PostgreSQL-based database initialization
    const result = await initializeDatabase()

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error 
        }, 
        { status: 500 }
      )
    }

    console.log("Database tables created successfully using PostgreSQL")
    return NextResponse.json({
      success: true,
      message: "Database tables initialized successfully using PostgreSQL",
    })
  } catch (error) {
    console.error("Unexpected error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

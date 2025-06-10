// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/init-db"

export async function GET() {
  try {
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

    return NextResponse.json({ 
      success: true, 
      message: "Schema updated successfully using PostgreSQL" 
    })
  } catch (error) {
    console.error("Error in update-schema route:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Internal server error" 
      }, 
      { status: 500 }
    )
  }
}

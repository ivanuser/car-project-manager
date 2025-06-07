// Force dynamic to prevent static generation
export const dynamic = 'force-dynamic'

import { NextResponse } from "next/server"
import { initializeExpenseSchema } from "@/lib/init-expense-schema"

export async function GET() {
  try {
    // Use our PostgreSQL-based expense schema initialization
    const result = await initializeExpenseSchema()

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
      message: "Expense schema updated successfully using PostgreSQL" 
    })
  } catch (error) {
    console.error("Error in update-expense-schema route:", error)
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : "Internal server error" 
      }, 
      { status: 500 }
    )
  }
}

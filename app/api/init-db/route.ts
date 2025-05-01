import { NextResponse } from "next/server"
import { initializeDatabase } from "@/lib/init-db"
import { initializeExpenseSchema } from "@/lib/init-expense-schema"

export async function GET() {
  try {
    // Initialize the main database schema
    const result = await initializeDatabase()

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: 500 },
      )
    }

    // Initialize the expense schema
    const expenseResult = await initializeExpenseSchema()

    if (!expenseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: expenseResult.error,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
    })
  } catch (error) {
    console.error("Error in init-db route:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

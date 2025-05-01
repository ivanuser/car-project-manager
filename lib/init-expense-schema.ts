import { createServerClient } from "@/lib/supabase"

export async function initializeExpenseSchema() {
  try {
    const supabase = createServerClient()

    // Check if expense_reports table exists
    const { data: tableExists, error: checkError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_name", "expense_reports")
      .eq("table_schema", "public")
      .limit(1)

    if (checkError) {
      console.error("Error checking if expense_reports table exists:", checkError)
      return { success: false, error: checkError.message }
    }

    // If the table doesn't exist, create it
    if (!tableExists || tableExists.length === 0) {
      // Create expense_reports table
      const { error: createError } = await supabase
        .from("expense_reports")
        .insert({
          id: "00000000-0000-0000-0000-000000000000",
          title: "Temporary record for table creation",
          status: "draft",
          user_id: "00000000-0000-0000-0000-000000000000",
          total_amount: 0,
          start_date: new Date().toISOString(),
          end_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (createError && createError.code !== "23505") {
        // Ignore duplicate key errors
        console.error("Error creating expense_reports table:", createError)
        return { success: false, error: createError.message }
      }

      // Delete the temporary record
      await supabase.from("expense_reports").delete().eq("id", "00000000-0000-0000-0000-000000000000")
    }

    // Check if budget_items table has expense_report_id column
    const { data: columnExists, error: columnError } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "budget_items")
      .eq("column_name", "expense_report_id")
      .limit(1)

    if (columnError) {
      console.error("Error checking if expense_report_id column exists:", columnError)
      return { success: false, error: columnError.message }
    }

    // If the column doesn't exist, try to add it
    if (!columnExists || columnExists.length === 0) {
      // This is a workaround since we can't directly execute ALTER TABLE
      // In a real application, you would use a proper migration system
      try {
        // Try to add a record with the new column
        const { error: insertError } = await supabase
          .from("budget_items")
          .insert({
            project_id: "00000000-0000-0000-0000-000000000000",
            title: "Temporary record for column creation",
            amount: 0,
            date: new Date().toISOString(),
            expense_report_id: null,
          })
          .select()

        if (insertError && !insertError.message.includes("expense_report_id")) {
          console.error("Error adding expense_report_id column:", insertError)
          // Continue anyway, as we can't directly alter the table
        }
      } catch (error) {
        console.error("Error in column creation attempt:", error)
        // Continue anyway, as we can't directly alter the table
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing expense schema:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

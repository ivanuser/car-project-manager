import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "db", "vendor-schema.sql")
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sqlContent })

    if (error) {
      console.error("Error executing SQL:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Vendor schema updated successfully" })
  } catch (error) {
    console.error("Error updating vendor schema:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

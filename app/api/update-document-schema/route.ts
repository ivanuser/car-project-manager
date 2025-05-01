import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Read the SQL file
    const sqlFilePath = path.join(process.cwd(), "db", "documentation-schema.sql")
    const sqlContent = fs.readFileSync(sqlFilePath, "utf8")

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql_query: sqlContent })

    if (error) {
      console.error("Error executing SQL:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating document schema:", error)
    return NextResponse.json({ success: false, error: "Failed to update document schema" }, { status: 500 })
  }
}

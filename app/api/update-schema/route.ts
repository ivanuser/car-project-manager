import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Read the schema update SQL file
    const schemaPath = path.join(process.cwd(), "db", "schema-update.sql")
    const schemaSQL = fs.readFileSync(schemaPath, "utf8")

    // Execute the SQL
    const { error } = await supabase.rpc("exec_sql", { sql: schemaSQL })

    if (error) {
      console.error("Error updating schema:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Schema updated successfully" })
  } catch (error) {
    console.error("Error in update-schema route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

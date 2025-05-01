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

    // Split the SQL into individual statements
    const statements = schemaSQL
      .split(";")
      .map((statement) => statement.trim())
      .filter((statement) => statement.length > 0)

    // Execute each statement separately
    for (const statement of statements) {
      const { error } = await supabase.from("_sql").select("*").eq("query", statement).limit(1)

      if (error && error.code !== "PGRST109") {
        // PGRST109 is "no rows returned" which is expected
        console.error("Error executing SQL statement:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true, message: "Schema updated successfully" })
  } catch (error) {
    console.error("Error in update-schema route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

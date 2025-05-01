import { createServerClient } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createServerClient()

    // Execute the SQL function to update the schema
    const { data, error } = await supabase.rpc("update_profile_schema")

    if (error) {
      console.error("Error updating profile schema:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: data || "Profile schema updated successfully" })
  } catch (error) {
    console.error("Unexpected error updating profile schema:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

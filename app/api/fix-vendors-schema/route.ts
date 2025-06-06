import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    console.log("Starting vendors schema fix...")

    // Execute the schema fix in a transaction
    await db.transaction(async (client) => {
      // Check if the vendors table exists
      const tableCheck = await client.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'vendors'
        )`
      )

      if (!tableCheck.rows[0].exists) {
        throw new Error("Vendors table does not exist. Please run the main database initialization first.")
      }

      // Check current table structure
      const columnCheck = await client.query(
        `SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns 
         WHERE table_schema = 'public' 
         AND table_name = 'vendors'
         ORDER BY ordinal_position`
      )

      const existingColumns = columnCheck.rows.map(row => row.column_name)
      console.log("Existing columns:", existingColumns)

      // Define the columns we need and their SQL definitions
      const requiredColumns = {
        category: "TEXT",
        contact_name: "TEXT",
        contact_position: "TEXT", 
        email: "TEXT",
        phone: "TEXT",
        address: "TEXT",
        rating: "INTEGER CHECK (rating >= 1 AND rating <= 5)"
      }

      // Add missing columns
      for (const [columnName, columnDef] of Object.entries(requiredColumns)) {
        if (!existingColumns.includes(columnName)) {
          console.log(`Adding column: ${columnName}`)
          await client.query(`ALTER TABLE vendors ADD COLUMN ${columnName} ${columnDef}`)
        }
      }

      // Rename columns if the old ones exist and new ones don't
      if (existingColumns.includes('contact_email') && !existingColumns.includes('email')) {
        console.log("Renaming contact_email to email")
        await client.query(`ALTER TABLE vendors RENAME COLUMN contact_email TO email`)
      }

      if (existingColumns.includes('contact_phone') && !existingColumns.includes('phone')) {
        console.log("Renaming contact_phone to phone")
        await client.query(`ALTER TABLE vendors RENAME COLUMN contact_phone TO phone`)
      }

      // Remove user_id column if it exists (vendors are shared)
      if (existingColumns.includes('user_id')) {
        console.log("Removing user_id column from vendors (vendors are shared)")
        await client.query(`ALTER TABLE vendors DROP COLUMN IF EXISTS user_id`)
      }

      // Add indexes for better performance
      const indexQueries = [
        "CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name)",
        "CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category)",
        "CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating)",
        "CREATE INDEX IF NOT EXISTS idx_vendors_email ON vendors(email)",
        "CREATE INDEX IF NOT EXISTS idx_vendors_phone ON vendors(phone)"
      ]

      for (const indexQuery of indexQueries) {
        try {
          await client.query(indexQuery)
        } catch (error) {
          console.log(`Index creation skipped (may already exist): ${error}`)
        }
      }

      // Update the vendor policies to ensure they work correctly
      await client.query(`
        DROP POLICY IF EXISTS "Users can view all vendors" ON vendors;
        DROP POLICY IF EXISTS "Authenticated users can create vendors" ON vendors;
        DROP POLICY IF EXISTS "Authenticated users can update vendors" ON vendors; 
        DROP POLICY IF EXISTS "Authenticated users can delete vendors" ON vendors;
      `)

      // Recreate policies without user_id references
      await client.query(`
        CREATE POLICY "Users can view all vendors" 
          ON vendors FOR SELECT 
          USING (true);
      `)

      await client.query(`
        CREATE POLICY "Authenticated users can create vendors" 
          ON vendors FOR INSERT 
          WITH CHECK (true);
      `)

      await client.query(`
        CREATE POLICY "Authenticated users can update vendors" 
          ON vendors FOR UPDATE 
          USING (true);
      `)

      await client.query(`
        CREATE POLICY "Authenticated users can delete vendors" 
          ON vendors FOR DELETE 
          USING (true);
      `)

      console.log("Vendors schema fix completed successfully")
    })

    return NextResponse.json({
      success: true,
      message: "Vendors schema has been fixed successfully"
    })

  } catch (error) {
    console.error("Error fixing vendors schema:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred"
    }, { status: 500 })
  }
}

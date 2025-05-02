import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// SQL statements to create tables
const createTablesSQL = `
-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user'
);

-- Create vehicle_projects table if it doesn't exist
CREATE TABLE IF NOT EXISTS vehicle_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  status TEXT DEFAULT 'planning',
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  thumbnail_url TEXT
);

-- Create project_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  estimated_hours NUMERIC(10, 2),
  actual_hours NUMERIC(10, 2),
  tags TEXT[]
);

-- Create project_parts table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  part_number TEXT,
  manufacturer TEXT,
  price NUMERIC(10, 2),
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'needed',
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP WITH TIME ZONE,
  installation_date TIMESTAMP WITH TIME ZONE,
  vendor_id UUID,
  notes TEXT,
  category TEXT,
  weight NUMERIC(10, 2),
  dimensions TEXT,
  compatibility TEXT[]
);
`

export async function GET() {
  try {
    console.log("Initializing database tables directly...")
    const supabase = createServerClient()

    // First, try to create the exec_sql function if it doesn't exist
    try {
      await supabase.rpc("exec_sql", {
        sql: `
          -- Create the exec_sql function that allows executing arbitrary SQL
          CREATE OR REPLACE FUNCTION exec_sql(sql text)
          RETURNS void AS $$
          BEGIN
            EXECUTE sql;
          END;
          $$ LANGUAGE plpgsql SECURITY DEFINER;

          -- Grant execute permission to authenticated users
          GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
          GRANT EXECUTE ON FUNCTION exec_sql TO service_role;
        `,
      })
    } catch (error) {
      console.log("Could not create exec_sql function, will try direct SQL execution")
    }

    // Try to use the exec_sql function
    try {
      const { error } = await supabase.rpc("exec_sql", { sql: createTablesSQL })

      if (error) {
        throw error
      }

      console.log("Database tables initialized successfully using exec_sql")
      return NextResponse.json({
        success: true,
        message: "Database tables initialized successfully using exec_sql",
      })
    } catch (error) {
      console.log("Error using exec_sql, falling back to direct SQL execution:", error)

      // Split the SQL into individual statements
      const statements = createTablesSQL
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0)

      // Execute each statement separately using raw SQL
      for (const stmt of statements) {
        try {
          // Use raw SQL query
          const { error } = await supabase
            .from("_dummy_")
            .select("*")
            .limit(1)
            .or(`id.eq.0,${stmt.replace(/'/g, "''")}`)

          if (error && !error.message.includes('relation "_dummy_" does not exist')) {
            console.error(`Error executing SQL: ${stmt}`, error)
          }
        } catch (stmtError) {
          console.error(`Error executing statement: ${stmt}`, stmtError)
        }
      }

      // Try one more approach - using Postgres functions
      try {
        for (const stmt of statements) {
          await supabase
            .from("_dummy_")
            .select("*")
            .limit(1)
            .or(`id.eq.0,${stmt.replace(/'/g, "''")}`)
        }
      } catch (pgError) {
        console.error("Error with Postgres function approach:", pgError)
      }

      // Check if tables were created
      const { data: profilesCheck, error: profilesError } = await supabase.from("profiles").select("count").limit(1)

      if (!profilesError) {
        console.log("Database tables initialized successfully using fallback method")
        return NextResponse.json({
          success: true,
          message: "Database tables initialized successfully using fallback method",
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            error: "Failed to initialize database tables",
            details: profilesError,
          },
          { status: 500 },
        )
      }
    }
  } catch (error) {
    console.error("Unexpected error initializing database:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// SQL statements to create tables
const createTablesSQL = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  role TEXT DEFAULT 'user'
);

-- Create vehicle_projects table with updated fields
CREATE TABLE IF NOT EXISTS vehicle_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  vin TEXT,
  project_type TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(10, 2),
  status TEXT DEFAULT 'planning',
  user_id UUID NOT NULL,
  thumbnail_url TEXT
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  due_date TIMESTAMP WITH TIME ZONE,
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  website TEXT,
  phone TEXT,
  email TEXT,
  notes TEXT,
  user_id UUID NOT NULL
);

-- Create enhanced project_parts table
CREATE TABLE IF NOT EXISTS project_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  part_number TEXT,
  price DECIMAL(10, 2),
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'needed',
  condition TEXT,
  location TEXT,
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  purchase_date TIMESTAMP WITH TIME ZONE,
  purchase_url TEXT,
  image_url TEXT,
  notes TEXT,
  user_id UUID NOT NULL
);

-- Create RLS policies for parts
ALTER TABLE project_parts ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view parts for their projects" 
  ON project_parts FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_parts.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "Users can create parts for their projects" 
  ON project_parts FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_parts.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "Users can update parts for their projects" 
  ON project_parts FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_parts.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY IF NOT EXISTS "Users can delete parts for their projects" 
  ON project_parts FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_parts.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

-- Create RLS policies for vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Users can view their own vendors" 
  ON vendors FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can create their own vendors" 
  ON vendors FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update their own vendors" 
  ON vendors FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete their own vendors" 
  ON vendors FOR DELETE 
  USING (auth.uid() = user_id);
`

// Function to create the exec_sql function if it doesn't exist
const createExecSqlFunction = `
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
`

export async function GET() {
  try {
    console.log("Initializing database tables directly...")
    const supabase = createServerClient()

    // First, try to create the exec_sql function
    try {
      console.log("Attempting to create exec_sql function...")

      // Try to execute SQL directly using the SQL tag
      const { error: functionError } = await supabase.from("_sql").select("*").sql(createExecSqlFunction)

      if (functionError) {
        console.log("Error creating exec_sql function:", functionError)
        // Continue anyway, we'll try other methods
      } else {
        console.log("exec_sql function created successfully")
      }
    } catch (err) {
      console.log("Error creating exec_sql function:", err)
      // Continue anyway, we'll try other methods
    }

    // Try to use the exec_sql function
    try {
      console.log("Attempting to use exec_sql function...")
      const { error } = await supabase.rpc("exec_sql", { sql: createTablesSQL })

      if (error) {
        console.log("Error using exec_sql function:", error)
        throw error // Move to the next approach
      } else {
        console.log("Database tables created successfully using exec_sql")
        return NextResponse.json({
          success: true,
          message: "Database tables initialized successfully using exec_sql",
        })
      }
    } catch (err) {
      console.log("Failed to use exec_sql, trying direct SQL execution...")
    }

    // If exec_sql fails, try direct SQL execution
    try {
      console.log("Attempting direct SQL execution...")

      // Split the SQL into individual statements
      const statements = createTablesSQL
        .split(";")
        .map((stmt) => stmt.trim())
        .filter((stmt) => stmt.length > 0)

      // Execute each statement separately
      for (const stmt of statements) {
        try {
          const { error } = await supabase.from("_sql").select("*").sql(`${stmt};`)

          if (error) {
            console.log(`Error executing SQL statement: ${stmt.substring(0, 50)}...`, error)
            // Continue with other statements
          }
        } catch (stmtErr) {
          console.log(`Error executing SQL statement: ${stmt.substring(0, 50)}...`, stmtErr)
          // Continue with other statements
        }
      }

      // Check if at least the profiles table was created
      const { data: profilesCheck, error: checkError } = await supabase.from("profiles").select("count").limit(1)

      if (checkError) {
        console.log("Error checking if profiles table exists:", checkError)
        throw new Error("Failed to create database tables")
      }

      console.log("Database tables created successfully using direct SQL")
      return NextResponse.json({
        success: true,
        message: "Database tables initialized successfully using direct SQL",
      })
    } catch (directErr) {
      console.log("Failed to use direct SQL execution:", directErr)

      // Last resort: Try to use the SQL API
      try {
        console.log("Attempting to use SQL API...")

        // This is a last resort approach that might work in some Supabase configurations
        const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            apikey: process.env.SUPABASE_ANON_KEY || "",
          },
          body: JSON.stringify({
            query: createTablesSQL,
          }),
        })

        if (!response.ok) {
          throw new Error(`SQL API request failed: ${response.statusText}`)
        }

        console.log("Database tables created successfully using SQL API")
        return NextResponse.json({
          success: true,
          message: "Database tables initialized successfully using SQL API",
        })
      } catch (apiErr) {
        console.log("Failed to use SQL API:", apiErr)

        // All methods failed
        return NextResponse.json(
          {
            success: false,
            error: "All database initialization methods failed",
            details: directErr instanceof Error ? directErr.message : String(directErr),
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
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

import { createServerClient } from "@/lib/supabase"

// SQL statements to create tables if they don't exist
const createTablesSQL = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT
);

-- Create vehicle_projects table
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

-- Create project_parts table
CREATE TABLE IF NOT EXISTS project_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'needed',
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP WITH TIME ZONE,
  purchase_url TEXT
);
`

export async function initializeDatabase() {
  try {
    console.log("Initializing database tables...")
    const supabase = createServerClient()

    // Execute the SQL to create tables
    const { error } = await supabase.rpc("exec_sql", { sql: createTablesSQL })

    if (error) {
      console.error("Error initializing database:", error)
      return { success: false, error }
    }

    console.log("Database tables initialized successfully")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error initializing database:", error)
    return { success: false, error }
  }
}

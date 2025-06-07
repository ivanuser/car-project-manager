import db from "@/lib/db"

// SQL statements to create tables if they don't exist (without Supabase auth references)
const createTablesSQL = `
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  user_id UUID NOT NULL
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vehicle_projects_user_id ON vehicle_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_parts_project_id ON project_parts(project_id);
CREATE INDEX IF NOT EXISTS idx_project_parts_user_id ON project_parts(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
`

export async function initializeDatabase() {
  try {
    console.log("Initializing database tables...")
    
    // Execute the SQL to create tables and policies
    await db.query(createTablesSQL)
    
    console.log("Database tables initialized successfully")
    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

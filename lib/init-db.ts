import db from "@/lib/db"

// SQL statements to create tables if they don't exist (without Supabase auth references)
const createTablesSQL = `
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  user_id UUID NOT NULL
);

-- Add user_id column to profiles if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='profiles' AND column_name='user_id') THEN
    ALTER TABLE profiles ADD COLUMN user_id UUID NOT NULL DEFAULT uuid_generate_v4();
  END IF;
END $$;

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
  completed_at TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium',
  build_stage TEXT,
  estimated_hours INTEGER
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
  user_id UUID NOT NULL,
  category TEXT,
  contact_name TEXT,
  contact_position TEXT,
  address TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5)
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

-- Create budget_categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  user_id UUID NOT NULL
);

-- Create budget_items table
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  date DATE NOT NULL,
  category_id UUID REFERENCES budget_categories(id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  vendor TEXT,
  receipt_url TEXT,
  user_id UUID NOT NULL
);

-- Create maintenance_schedules table
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  interval_type TEXT NOT NULL CHECK (interval_type IN ('mileage', 'time')),
  interval_value INTEGER NOT NULL,
  last_completed_at TIMESTAMP WITH TIME ZONE,
  next_due_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due', 'overdue', 'completed')),
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  notification_sent BOOLEAN DEFAULT FALSE
);

-- Create maintenance_logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  schedule_id UUID NOT NULL REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  mileage INTEGER,
  notes TEXT,
  cost DECIMAL(10, 2),
  performed_by TEXT
);

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Only create triggers if they don't already exist
DO $$ 
BEGIN
  -- Profiles trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at
      BEFORE UPDATE ON profiles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Vehicle projects trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vehicle_projects_updated_at') THEN
    CREATE TRIGGER update_vehicle_projects_updated_at
      BEFORE UPDATE ON vehicle_projects
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Project tasks trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_tasks_updated_at') THEN
    CREATE TRIGGER update_project_tasks_updated_at
      BEFORE UPDATE ON project_tasks
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Vendors trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vendors_updated_at') THEN
    CREATE TRIGGER update_vendors_updated_at
      BEFORE UPDATE ON vendors
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Project parts trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_parts_updated_at') THEN
    CREATE TRIGGER update_project_parts_updated_at
      BEFORE UPDATE ON project_parts
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Budget categories trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_budget_categories_updated_at') THEN
    CREATE TRIGGER update_budget_categories_updated_at
      BEFORE UPDATE ON budget_categories
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Budget items trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_budget_items_updated_at') THEN
    CREATE TRIGGER update_budget_items_updated_at
      BEFORE UPDATE ON budget_items
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Maintenance schedules trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_schedules_updated_at') THEN
    CREATE TRIGGER update_maintenance_schedules_updated_at
      BEFORE UPDATE ON maintenance_schedules
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Maintenance logs trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_maintenance_logs_updated_at') THEN
    CREATE TRIGGER update_maintenance_logs_updated_at
      BEFORE UPDATE ON maintenance_logs
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
`

const createIndexesSQL = `
-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_vehicle_projects_user_id ON vehicle_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_parts_project_id ON project_parts(project_id);
CREATE INDEX IF NOT EXISTS idx_project_parts_user_id ON project_parts(user_id);
CREATE INDEX IF NOT EXISTS idx_vendors_user_id ON vendors(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id ON budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_project_id ON budget_items(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_project_id ON maintenance_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_schedule_id ON maintenance_logs(schedule_id);

-- Only create profiles user_id index if the column exists
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='profiles' AND column_name='user_id') THEN
    CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
  END IF;
END $$;
`

export async function initializeDatabase() {
  try {
    console.log("Initializing database tables...")
    
    // Execute the SQL to create tables first
    await db.query(createTablesSQL)
    
    console.log("Creating indexes...")
    
    // Execute the SQL to create indexes
    await db.query(createIndexesSQL)
    
    console.log("Database tables and indexes initialized successfully")
    return { success: true }
  } catch (error) {
    console.error("Error initializing database:", error)
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
  }
}

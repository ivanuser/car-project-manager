import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// SQL statements to create tables
const createTablesSQL = `
-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  role TEXT DEFAULT 'user'
);

-- Create vehicle_projects table if not exists
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
  thumbnail_url TEXT,
  vin TEXT
);

-- Create project_tasks table if not exists
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  estimated_hours NUMERIC(10, 2),
  actual_hours NUMERIC(10, 2),
  stage TEXT DEFAULT 'planning'
);

-- Create project_parts table if not exists
CREATE TABLE IF NOT EXISTS project_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  part_number TEXT,
  quantity INTEGER DEFAULT 1,
  price NUMERIC(10, 2),
  status TEXT DEFAULT 'needed',
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  vendor_id UUID,
  category TEXT,
  notes TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE,
  installation_date TIMESTAMP WITH TIME ZONE
);

-- Create project_photos table if not exists
CREATE TABLE IF NOT EXISTS project_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  photo_url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  is_before_photo BOOLEAN DEFAULT false,
  is_after_photo BOOLEAN DEFAULT false,
  taken_at TIMESTAMP WITH TIME ZONE,
  tags TEXT[]
);

-- Create vendors table if not exists
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  website TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT,
  user_id UUID REFERENCES profiles(id),
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'USA',
  rating INTEGER,
  specialties TEXT[]
);

-- Create documents table if not exists
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  user_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  category TEXT,
  tags TEXT[]
);

-- Create expense_reports table if not exists
CREATE TABLE IF NOT EXISTS expense_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  total_amount NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  user_id UUID REFERENCES profiles(id),
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by UUID REFERENCES profiles(id)
);

-- Create expenses table if not exists
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  category TEXT,
  receipt_url TEXT,
  report_id UUID REFERENCES expense_reports(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id),
  tax_deductible BOOLEAN DEFAULT false,
  payment_method TEXT
);

-- Create maintenance_schedules table if not exists
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  frequency_type TEXT NOT NULL,
  frequency_value INTEGER NOT NULL,
  last_performed TIMESTAMP WITH TIME ZONE,
  next_due TIMESTAMP WITH TIME ZONE,
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  priority TEXT DEFAULT 'medium',
  notes TEXT
);

-- Create maintenance_logs table if not exists
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  performed_by UUID REFERENCES profiles(id),
  notes TEXT,
  cost NUMERIC(10, 2),
  parts_used TEXT[],
  odometer_reading INTEGER,
  duration_minutes INTEGER
);

-- Create timeline_items table if not exists
CREATE TABLE IF NOT EXISTS timeline_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'planned',
  type TEXT DEFAULT 'task',
  related_id UUID,
  related_type TEXT,
  color TEXT
);

-- Create project_milestones table if not exists
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium'
);

-- Create budget_categories table if not exists
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  user_id UUID REFERENCES profiles(id),
  is_system BOOLEAN DEFAULT false
);

-- Create project_budgets table if not exists
CREATE TABLE IF NOT EXISTS project_budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  total_budget NUMERIC(10, 2) NOT NULL,
  current_spent NUMERIC(10, 2) DEFAULT 0,
  currency TEXT DEFAULT 'USD',
  notes TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create budget_allocations table if not exists
CREATE TABLE IF NOT EXISTS budget_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  budget_id UUID REFERENCES project_budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id),
  allocated_amount NUMERIC(10, 2) NOT NULL,
  spent_amount NUMERIC(10, 2) DEFAULT 0
);

-- Create budget_items table if not exists
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  budget_id UUID REFERENCES project_budgets(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  estimated_cost NUMERIC(10, 2) NOT NULL,
  actual_cost NUMERIC(10, 2),
  purchase_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'planned',
  vendor_id UUID REFERENCES vendors(id),
  receipt_url TEXT
);

-- Create system_logs table if not exists
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  event_type TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  severity TEXT DEFAULT 'info'
);

-- Create admin_settings table if not exists
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string',
  description TEXT,
  is_public BOOLEAN DEFAULT false
);

-- Create document_categories table if not exists
CREATE TABLE IF NOT EXISTS document_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  user_id UUID REFERENCES profiles(id),
  is_system BOOLEAN DEFAULT false
);

-- Create photo_tags table if not exists
CREATE TABLE IF NOT EXISTS photo_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  user_id UUID REFERENCES profiles(id)
);

-- Create photo_tag_relations table if not exists
CREATE TABLE IF NOT EXISTS photo_tag_relations (
  photo_id UUID REFERENCES project_photos(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES photo_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);

-- Create document_tags table if not exists
CREATE TABLE IF NOT EXISTS document_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  user_id UUID REFERENCES profiles(id)
);

-- Create document_tag_relations table if not exists
CREATE TABLE IF NOT EXISTS document_tag_relations (
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES document_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag_id)
);

-- Create work_sessions table if not exists
CREATE TABLE IF NOT EXISTS work_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id),
  user_id UUID REFERENCES profiles(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  notes TEXT,
  status TEXT DEFAULT 'in_progress'
);

-- Create api_keys table if not exists
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  key_name TEXT NOT NULL,
  key_value TEXT NOT NULL,
  user_id UUID REFERENCES profiles(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  last_used_at TIMESTAMP WITH TIME ZONE,
  permissions TEXT[],
  is_active BOOLEAN DEFAULT true
);

-- Create api_usage table if not exists
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  response_code INTEGER,
  response_time_ms INTEGER,
  user_id UUID REFERENCES profiles(id),
  ip_address TEXT
);

-- Create system_updates table if not exists
CREATE TABLE IF NOT EXISTS system_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version TEXT NOT NULL,
  update_type TEXT NOT NULL,
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_by UUID REFERENCES profiles(id),
  is_successful BOOLEAN DEFAULT true,
  rollback_info JSONB
);

-- Insert default budget categories if they don't exist
INSERT INTO budget_categories (name, description, color, is_system)
VALUES
  ('Parts', 'Mechanical and body parts', '#3B82F6', true),
  ('Labor', 'Professional labor costs', '#10B981', true),
  ('Tools', 'Tools and equipment', '#F59E0B', true),
  ('Materials', 'Consumable materials', '#6366F1', true),
  ('Miscellaneous', 'Other expenses', '#8B5CF6', true)
ON CONFLICT DO NOTHING;

-- Insert default document categories if they don't exist
INSERT INTO document_categories (name, description, color, is_system)
VALUES
  ('Manuals', 'Service and owner manuals', '#3B82F6', true),
  ('Receipts', 'Purchase receipts', '#10B981', true),
  ('Specifications', 'Technical specifications', '#F59E0B', true),
  ('Diagrams', 'Wiring and assembly diagrams', '#6366F1', true),
  ('Certificates', 'Certificates and legal documents', '#8B5CF6', true)
ON CONFLICT DO NOTHING;

-- Insert default admin settings if they don't exist
INSERT INTO admin_settings (setting_key, setting_value, setting_type, description, is_public)
VALUES
  ('site_name', 'CAJPRO', 'string', 'Site name displayed in the header', true),
  ('max_upload_size', '10485760', 'number', 'Maximum file upload size in bytes', true),
  ('allowed_file_types', 'jpg,jpeg,png,pdf,doc,docx', 'array', 'Allowed file upload types', true),
  ('maintenance_mode', 'false', 'boolean', 'Enable maintenance mode', true),
  ('default_theme', 'light', 'string', 'Default theme for new users', true)
ON CONFLICT DO NOTHING;
`

export async function GET() {
  try {
    console.log("Initializing database tables directly...")
    const supabase = createServerClient()

    // Split the SQL into individual statements
    const statements = createTablesSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0)

    // Execute each statement separately
    for (const stmt of statements) {
      try {
        const { error } = await supabase.rpc("exec_sql", { sql: `${stmt};` })

        // If exec_sql function doesn't exist, try direct query
        if (error && error.message.includes("function public.exec_sql")) {
          console.log("exec_sql function not found, trying direct query...")

          // Try to create the exec_sql function
          await supabase
            .from("_sql")
            .select()
            .sql(`
            CREATE OR REPLACE FUNCTION exec_sql(sql text)
            RETURNS void AS $$
            BEGIN
              EXECUTE sql;
            END;
            $$ LANGUAGE plpgsql SECURITY DEFINER;
            
            GRANT EXECUTE ON FUNCTION exec_sql TO authenticated;
            GRANT EXECUTE ON FUNCTION exec_sql TO service_role;
          `)

          // Try again with the newly created function
          const retryResult = await supabase.rpc("exec_sql", { sql: `${stmt};` })

          if (retryResult.error) {
            // If still failing, try direct query as last resort
            const directResult = await supabase.from("_sql").select().sql(`${stmt};`)

            if (directResult.error) {
              console.error(`Error executing SQL: ${stmt}`, directResult.error)
              return NextResponse.json(
                {
                  success: false,
                  error: directResult.error,
                  statement: stmt,
                },
                { status: 500 },
              )
            }
          }
        } else if (error) {
          console.error(`Error executing SQL with exec_sql: ${stmt}`, error)

          // Try direct query as fallback
          const directResult = await supabase.from("_sql").select().sql(`${stmt};`)

          if (directResult.error) {
            console.error(`Error executing SQL directly: ${stmt}`, directResult.error)
            return NextResponse.json(
              {
                success: false,
                error: directResult.error,
                statement: stmt,
              },
              { status: 500 },
            )
          }
        }
      } catch (stmtError) {
        console.error(`Exception executing SQL: ${stmt}`, stmtError)
        return NextResponse.json(
          {
            success: false,
            error: stmtError instanceof Error ? stmtError.message : String(stmtError),
            statement: stmt,
          },
          { status: 500 },
        )
      }
    }

    console.log("Database tables initialized successfully")
    return NextResponse.json({
      success: true,
      message: "Database tables initialized successfully",
    })
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

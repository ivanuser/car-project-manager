-- CAJ-Pro PostgreSQL Schema (No Supabase Dependencies)
-- This schema is designed for PostgreSQL without Supabase authentication

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP WITH TIME ZONE,
  reset_token TEXT,
  reset_token_expires_at TIMESTAMP WITH TIME ZONE
);

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  website TEXT,
  phone TEXT
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
  vin TEXT,
  project_type TEXT DEFAULT 'restoration',
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12, 2),
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  build_stage TEXT DEFAULT 'planning' CHECK (build_stage IN ('planning', 'disassembly', 'cleaning', 'repair', 'fabrication', 'painting', 'assembly', 'electrical', 'testing', 'finishing')),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  thumbnail_url TEXT
);

-- Create project_tasks table
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  build_stage TEXT DEFAULT 'planning' CHECK (build_stage IN ('planning', 'disassembly', 'cleaning', 'repair', 'fabrication', 'painting', 'assembly', 'electrical', 'testing', 'finishing')),
  estimated_hours DECIMAL(5,2),
  actual_hours DECIMAL(5,2),
  due_date TIMESTAMP WITH TIME ZONE,
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT
);

-- Create vendors table (shared across all users)
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  category TEXT,
  contact_name TEXT,
  contact_position TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  country TEXT DEFAULT 'US',
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create project_parts table
CREATE TABLE IF NOT EXISTS project_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  part_number TEXT,
  oem_part_number TEXT,
  price DECIMAL(10, 2),
  quantity INTEGER DEFAULT 1,
  status TEXT DEFAULT 'needed' CHECK (status IN ('needed', 'ordered', 'received', 'installed', 'returned', 'cancelled')),
  condition TEXT CHECK (condition IN ('new', 'used', 'refurbished', 'damaged')),
  location TEXT,
  notes TEXT,
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  purchase_date TIMESTAMP WITH TIME ZONE,
  purchase_url TEXT,
  image_url TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE
);

-- Create budget_categories table
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE
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
  vendor_name TEXT,
  receipt_url TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  transaction_type TEXT DEFAULT 'expense' CHECK (transaction_type IN ('expense', 'income'))
);

-- Create maintenance_schedules table
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  interval_type TEXT NOT NULL CHECK (interval_type IN ('miles', 'months', 'hours', 'years')),
  interval_value INTEGER NOT NULL CHECK (interval_value > 0),
  last_performed_at TIMESTAMP WITH TIME ZONE,
  last_performed_value INTEGER,
  next_due_at TIMESTAMP WITH TIME ZONE,
  next_due_value INTEGER,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'due', 'overdue', 'completed', 'skipped')),
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMP WITH TIME ZONE,
  cost_estimate DECIMAL(10, 2)
);

-- Create maintenance_logs table
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  schedule_id UUID REFERENCES maintenance_schedules(id) ON DELETE SET NULL,
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  performed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  performed_value INTEGER,
  cost DECIMAL(10, 2),
  notes TEXT,
  parts_used TEXT[],
  performed_by TEXT,
  location TEXT
);

-- Create maintenance_notifications table
CREATE TABLE IF NOT EXISTS maintenance_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  schedule_id UUID NOT NULL REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'dismissed')),
  read_at TIMESTAMP WITH TIME ZONE,
  notification_type TEXT DEFAULT 'upcoming' CHECK (notification_type IN ('upcoming', 'due', 'overdue')),
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create media table for photos and documents
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  file_type TEXT CHECK (file_type IN ('image', 'document', 'video', 'other')),
  title TEXT,
  description TEXT,
  tags TEXT[],
  build_stage TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  metadata JSONB
);

-- Create sessions table for authentication
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address INET,
  user_agent TEXT
);

-- Create activity_logs table for audit trail
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_vehicle_projects_user_id ON vehicle_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_projects_status ON vehicle_projects(status);
CREATE INDEX IF NOT EXISTS idx_vehicle_projects_build_stage ON vehicle_projects(build_stage);

CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON project_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_project_tasks_build_stage ON project_tasks(build_stage);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON project_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to ON project_tasks(assigned_to);

CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_rating ON vendors(rating);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON vendors(is_active);

CREATE INDEX IF NOT EXISTS idx_project_parts_project_id ON project_parts(project_id);
CREATE INDEX IF NOT EXISTS idx_project_parts_user_id ON project_parts(user_id);
CREATE INDEX IF NOT EXISTS idx_project_parts_status ON project_parts(status);
CREATE INDEX IF NOT EXISTS idx_project_parts_part_number ON project_parts(part_number);
CREATE INDEX IF NOT EXISTS idx_project_parts_vendor_id ON project_parts(vendor_id);

CREATE INDEX IF NOT EXISTS idx_budget_categories_user_id ON budget_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_is_active ON budget_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_budget_items_project_id ON budget_items(project_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_user_id ON budget_items(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_category_id ON budget_items(category_id);
CREATE INDEX IF NOT EXISTS idx_budget_items_date ON budget_items(date);

CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_project_id ON maintenance_schedules(project_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_status ON maintenance_schedules(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_priority ON maintenance_schedules(priority);
CREATE INDEX IF NOT EXISTS idx_maintenance_schedules_next_due_at ON maintenance_schedules(next_due_at);

CREATE INDEX IF NOT EXISTS idx_maintenance_logs_project_id ON maintenance_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_schedule_id ON maintenance_logs(schedule_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_performed_at ON maintenance_logs(performed_at);

CREATE INDEX IF NOT EXISTS idx_maintenance_notifications_user_id ON maintenance_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_notifications_schedule_id ON maintenance_notifications(schedule_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_notifications_status ON maintenance_notifications(status);

CREATE INDEX IF NOT EXISTS idx_media_project_id ON media(project_id);
CREATE INDEX IF NOT EXISTS idx_media_user_id ON media(user_id);
CREATE INDEX IF NOT EXISTS idx_media_file_type ON media(file_type);
CREATE INDEX IF NOT EXISTS idx_media_build_stage ON media(build_stage);
CREATE INDEX IF NOT EXISTS idx_media_is_featured ON media(is_featured);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource_type ON activity_logs(resource_type);

-- Create functions for handling timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE OR REPLACE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_vehicle_projects_updated_at
BEFORE UPDATE ON vehicle_projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_project_tasks_updated_at
BEFORE UPDATE ON project_tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON vendors
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_project_parts_updated_at
BEFORE UPDATE ON project_parts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_budget_categories_updated_at
BEFORE UPDATE ON budget_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_budget_items_updated_at
BEFORE UPDATE ON budget_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_maintenance_schedules_updated_at
BEFORE UPDATE ON maintenance_schedules
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_maintenance_logs_updated_at
BEFORE UPDATE ON maintenance_logs
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_maintenance_notifications_updated_at
BEFORE UPDATE ON maintenance_notifications
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_media_updated_at
BEFORE UPDATE ON media
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_sessions_updated_at
BEFORE UPDATE ON sessions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create function to update maintenance schedule status
CREATE OR REPLACE FUNCTION update_maintenance_schedule_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Update status based on next_due_at
  IF NEW.next_due_at IS NOT NULL THEN
    IF NEW.next_due_at < NOW() - INTERVAL '7 days' THEN
      NEW.status = 'overdue';
    ELSIF NEW.next_due_at < NOW() THEN
      NEW.status = 'due';
    ELSE
      NEW.status = 'upcoming';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating maintenance schedule status
CREATE OR REPLACE TRIGGER update_maintenance_schedule_status_trigger
BEFORE INSERT OR UPDATE ON maintenance_schedules
FOR EACH ROW EXECUTE FUNCTION update_maintenance_schedule_status();

-- Create function to clean up expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to log activity
CREATE OR REPLACE FUNCTION log_activity(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_details JSONB DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO activity_logs (
    user_id, action, resource_type, resource_id, details, ip_address, user_agent
  ) VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id, p_details, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default data
INSERT INTO budget_categories (id, name, description, color, user_id)
SELECT 
  uuid_generate_v4(),
  'General',
  'General project expenses',
  '#3B82F6',
  '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (SELECT 1 FROM budget_categories WHERE name = 'General' AND user_id = '00000000-0000-0000-0000-000000000000');

INSERT INTO budget_categories (id, name, description, color, user_id)
SELECT 
  uuid_generate_v4(),
  'Parts',
  'Parts and components',
  '#10B981',
  '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (SELECT 1 FROM budget_categories WHERE name = 'Parts' AND user_id = '00000000-0000-0000-0000-000000000000');

INSERT INTO budget_categories (id, name, description, color, user_id)
SELECT 
  uuid_generate_v4(),
  'Labor',
  'Professional services and labor',
  '#F59E0B',
  '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (SELECT 1 FROM budget_categories WHERE name = 'Labor' AND user_id = '00000000-0000-0000-0000-000000000000');

INSERT INTO budget_categories (id, name, description, color, user_id)
SELECT 
  uuid_generate_v4(),
  'Tools',
  'Tools and equipment',
  '#EF4444',
  '00000000-0000-0000-0000-000000000000'
WHERE NOT EXISTS (SELECT 1 FROM budget_categories WHERE name = 'Tools' AND user_id = '00000000-0000-0000-0000-000000000000');

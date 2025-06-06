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
  vin TEXT,
  project_type TEXT,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12, 2),
  status TEXT DEFAULT 'planning',
  build_stage TEXT DEFAULT 'planning',
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
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
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  build_stage TEXT DEFAULT 'planning' CHECK (build_stage IN ('planning', 'disassembly', 'cleaning', 'repair', 'fabrication', 'painting', 'assembly', 'electrical', 'testing', 'finishing')),
  estimated_hours DECIMAL(5,2),
  due_date TIMESTAMP WITH TIME ZONE,
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for project_tasks table
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON project_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_project_tasks_build_stage ON project_tasks(build_stage);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON project_tasks(due_date);

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

-- Create RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_parts ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Vehicle projects policies
CREATE POLICY "Users can view their own projects" 
  ON vehicle_projects FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" 
  ON vehicle_projects FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" 
  ON vehicle_projects FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" 
  ON vehicle_projects FOR DELETE 
  USING (auth.uid() = user_id);

-- Project tasks policies
CREATE POLICY "Users can view tasks for their projects" 
  ON project_tasks FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_tasks.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create tasks for their projects" 
  ON project_tasks FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_tasks.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update tasks for their projects" 
  ON project_tasks FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_tasks.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete tasks for their projects" 
  ON project_tasks FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_tasks.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

-- Project parts policies
CREATE POLICY "Users can view parts for their projects" 
  ON project_parts FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_parts.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create parts for their projects" 
  ON project_parts FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_parts.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update parts for their projects" 
  ON project_parts FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_parts.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete parts for their projects" 
  ON project_parts FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_parts.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

-- Create functions for handling timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updating timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_vehicle_projects_updated_at
BEFORE UPDATE ON vehicle_projects
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_project_tasks_updated_at
BEFORE UPDATE ON project_tasks
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_project_parts_updated_at
BEFORE UPDATE ON project_parts
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

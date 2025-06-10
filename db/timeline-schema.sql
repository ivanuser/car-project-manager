-- Create milestones table
CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  color TEXT,
  is_critical BOOLEAN DEFAULT FALSE
);

-- Create work sessions table
CREATE TABLE IF NOT EXISTS work_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  location TEXT,
  notes TEXT,
  status TEXT DEFAULT 'scheduled'
);

-- Create timeline_items table for Gantt chart
CREATE TABLE IF NOT EXISTS timeline_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES timeline_items(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  type TEXT DEFAULT 'task', -- 'task', 'milestone', 'project'
  dependencies TEXT[], -- Array of timeline_item IDs that this item depends on
  color TEXT,
  is_critical_path BOOLEAN DEFAULT FALSE,
  task_id UUID REFERENCES project_tasks(id) ON DELETE SET NULL,
  milestone_id UUID REFERENCES project_milestones(id) ON DELETE SET NULL
);

-- Add RLS policies
ALTER TABLE project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_items ENABLE ROW LEVEL SECURITY;

-- Project milestones policies
CREATE POLICY "Users can view milestones for their projects" 
  ON project_milestones FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_milestones.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create milestones for their projects" 
  ON project_milestones FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_milestones.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update milestones for their projects" 
  ON project_milestones FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_milestones.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete milestones for their projects" 
  ON project_milestones FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_milestones.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

-- Work sessions policies
CREATE POLICY "Users can view work sessions for their projects" 
  ON work_sessions FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = work_sessions.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create work sessions for their projects" 
  ON work_sessions FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = work_sessions.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update work sessions for their projects" 
  ON work_sessions FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = work_sessions.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete work sessions for their projects" 
  ON work_sessions FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = work_sessions.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

-- Timeline items policies
CREATE POLICY "Users can view timeline items for their projects" 
  ON timeline_items FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = timeline_items.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create timeline items for their projects" 
  ON timeline_items FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = timeline_items.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update timeline items for their projects" 
  ON timeline_items FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = timeline_items.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete timeline items for their projects" 
  ON timeline_items FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = timeline_items.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

-- Create triggers for updating timestamps
CREATE TRIGGER update_project_milestones_updated_at
BEFORE UPDATE ON project_milestones
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_work_sessions_updated_at
BEFORE UPDATE ON work_sessions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_timeline_items_updated_at
BEFORE UPDATE ON timeline_items
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

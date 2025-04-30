-- Add project_tasks table if it doesn't exist
CREATE TABLE IF NOT EXISTS project_tasks (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  description TEXT,
  project_id BIGINT REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  build_stage TEXT NOT NULL DEFAULT 'planning',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add build_stage column to vehicle_projects if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'vehicle_projects' AND column_name = 'build_stage'
  ) THEN
    ALTER TABLE vehicle_projects ADD COLUMN build_stage TEXT NOT NULL DEFAULT 'planning';
  END IF;
END $$;

-- Add RLS policies for project_tasks
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;

-- Create policy for selecting tasks
CREATE POLICY "Users can view their own tasks" 
ON project_tasks
FOR SELECT 
USING (
  project_id IN (
    SELECT id FROM vehicle_projects WHERE user_id = auth.uid()
  )
);

-- Create policy for inserting tasks
CREATE POLICY "Users can insert their own tasks" 
ON project_tasks
FOR INSERT 
WITH CHECK (
  project_id IN (
    SELECT id FROM vehicle_projects WHERE user_id = auth.uid()
  )
);

-- Create policy for updating tasks
CREATE POLICY "Users can update their own tasks" 
ON project_tasks
FOR UPDATE 
USING (
  project_id IN (
    SELECT id FROM vehicle_projects WHERE user_id = auth.uid()
  )
);

-- Create policy for deleting tasks
CREATE POLICY "Users can delete their own tasks" 
ON project_tasks
FOR DELETE 
USING (
  project_id IN (
    SELECT id FROM vehicle_projects WHERE user_id = auth.uid()
  )
);

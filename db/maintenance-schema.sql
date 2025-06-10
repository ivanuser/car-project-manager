-- Create maintenance_schedules table
CREATE TABLE IF NOT EXISTS maintenance_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  interval_type TEXT NOT NULL, -- 'miles', 'months', 'hours'
  interval_value INTEGER NOT NULL,
  last_performed_at TIMESTAMP WITH TIME ZONE,
  last_performed_value INTEGER, -- miles, hours, etc.
  next_due_at TIMESTAMP WITH TIME ZONE,
  next_due_value INTEGER, -- miles, hours, etc.
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'due', 'overdue', 'completed'
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMP WITH TIME ZONE
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
  performed_value INTEGER, -- miles, hours, etc.
  cost DECIMAL(10, 2),
  notes TEXT,
  parts_used TEXT[]
);

-- Create maintenance_notifications table
CREATE TABLE IF NOT EXISTS maintenance_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  schedule_id UUID NOT NULL REFERENCES maintenance_schedules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'unread', -- 'unread', 'read', 'dismissed'
  read_at TIMESTAMP WITH TIME ZONE,
  notification_type TEXT DEFAULT 'upcoming', -- 'upcoming', 'due', 'overdue'
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS
ALTER TABLE maintenance_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for maintenance_schedules
CREATE POLICY "Users can view maintenance schedules for their projects" 
  ON maintenance_schedules FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = maintenance_schedules.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create maintenance schedules for their projects" 
  ON maintenance_schedules FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = maintenance_schedules.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update maintenance schedules for their projects" 
  ON maintenance_schedules FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = maintenance_schedules.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete maintenance schedules for their projects" 
  ON maintenance_schedules FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = maintenance_schedules.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

-- Create RLS policies for maintenance_logs
CREATE POLICY "Users can view maintenance logs for their projects" 
  ON maintenance_logs FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = maintenance_logs.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create maintenance logs for their projects" 
  ON maintenance_logs FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = maintenance_logs.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update maintenance logs for their projects" 
  ON maintenance_logs FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = maintenance_logs.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete maintenance logs for their projects" 
  ON maintenance_logs FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = maintenance_logs.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

-- Create RLS policies for maintenance_notifications
CREATE POLICY "Users can view their own maintenance notifications" 
  ON maintenance_notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own maintenance notifications" 
  ON maintenance_notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own maintenance notifications" 
  ON maintenance_notifications FOR DELETE 
  USING (auth.uid() = user_id);

-- Create triggers for updating timestamps
CREATE TRIGGER update_maintenance_schedules_updated_at
BEFORE UPDATE ON maintenance_schedules
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_maintenance_logs_updated_at
BEFORE UPDATE ON maintenance_logs
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_maintenance_notifications_updated_at
BEFORE UPDATE ON maintenance_notifications
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

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
CREATE TRIGGER update_maintenance_schedule_status_trigger
BEFORE INSERT OR UPDATE ON maintenance_schedules
FOR EACH ROW EXECUTE PROCEDURE update_maintenance_schedule_status();

-- Fix project_tasks table schema
-- Add missing columns for task management functionality

-- Add priority column (enum-like with check constraint)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_tasks' 
                   AND column_name = 'priority') THEN
        ALTER TABLE project_tasks ADD COLUMN priority TEXT DEFAULT 'medium';
        ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_priority_check 
            CHECK (priority IN ('low', 'medium', 'high'));
    END IF;
END $$;

-- Add build_stage column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_tasks' 
                   AND column_name = 'build_stage') THEN
        ALTER TABLE project_tasks ADD COLUMN build_stage TEXT DEFAULT 'planning';
        ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_build_stage_check 
            CHECK (build_stage IN ('planning', 'disassembly', 'cleaning', 'repair', 'fabrication', 'painting', 'assembly', 'electrical', 'testing', 'finishing'));
    END IF;
END $$;

-- Add estimated_hours column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_tasks' 
                   AND column_name = 'estimated_hours') THEN
        ALTER TABLE project_tasks ADD COLUMN estimated_hours DECIMAL(5,2);
    END IF;
END $$;

-- Update status column to have proper check constraint if not already there
DO $$ 
BEGIN
    -- Drop existing constraint if it exists (in case it's named differently)
    IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
               WHERE table_name = 'project_tasks' 
               AND column_name = 'status'
               AND constraint_name LIKE '%status%') THEN
        ALTER TABLE project_tasks DROP CONSTRAINT IF EXISTS project_tasks_status_check;
    END IF;
    
    -- Add the status constraint
    ALTER TABLE project_tasks ADD CONSTRAINT project_tasks_status_check 
        CHECK (status IN ('todo', 'in_progress', 'completed', 'blocked'));
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_tasks_priority ON project_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_project_tasks_build_stage ON project_tasks(build_stage);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date ON project_tasks(due_date);

-- Update any existing tasks to have default values if they're NULL
UPDATE project_tasks SET priority = 'medium' WHERE priority IS NULL;
UPDATE project_tasks SET build_stage = 'planning' WHERE build_stage IS NULL;

COMMENT ON TABLE project_tasks IS 'Tasks associated with vehicle projects';
COMMENT ON COLUMN project_tasks.priority IS 'Task priority: low, medium, high';
COMMENT ON COLUMN project_tasks.build_stage IS 'Build stage this task belongs to';
COMMENT ON COLUMN project_tasks.estimated_hours IS 'Estimated hours to complete the task';
COMMENT ON COLUMN project_tasks.status IS 'Current task status: todo, in_progress, completed, blocked';

-- Add expense_report_id column to budget_items if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'budget_items' AND column_name = 'expense_report_id'
  ) THEN
    ALTER TABLE budget_items ADD COLUMN expense_report_id UUID REFERENCES expense_reports(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create expense_reports table if it doesn't exist
CREATE TABLE IF NOT EXISTS expense_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expense_approvals table if it doesn't exist
CREATE TABLE IF NOT EXISTS expense_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  comment TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create expense_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS expense_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id UUID NOT NULL REFERENCES expense_reports(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on the new tables
ALTER TABLE expense_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expense_reports
CREATE POLICY "Users can view their own expense reports" 
  ON expense_reports FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expense reports" 
  ON expense_reports FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expense reports" 
  ON expense_reports FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expense reports" 
  ON expense_reports FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for expense_approvals
CREATE POLICY "Users can view approvals for their reports" 
  ON expense_approvals FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM expense_reports 
    WHERE expense_reports.id = expense_approvals.report_id 
    AND expense_reports.user_id = auth.uid()
  ) OR auth.uid() = approver_id);

CREATE POLICY "Users can create approvals for reports they can approve" 
  ON expense_approvals FOR INSERT 
  WITH CHECK (auth.uid() = approver_id);

CREATE POLICY "Users can update approvals they created" 
  ON expense_approvals FOR UPDATE 
  USING (auth.uid() = approver_id);

-- Create RLS policies for expense_comments
CREATE POLICY "Users can view comments on their reports" 
  ON expense_comments FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM expense_reports 
    WHERE expense_reports.id = expense_comments.report_id 
    AND expense_reports.user_id = auth.uid()
  ) OR auth.uid() = user_id);

CREATE POLICY "Users can create comments" 
  ON expense_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON expense_comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON expense_comments FOR DELETE 
  USING (auth.uid() = user_id);

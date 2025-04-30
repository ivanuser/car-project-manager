-- Budget Categories Table
CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  color VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO budget_categories (name, description, icon, color)
VALUES 
  ('Parts', 'Engine, drivetrain, suspension, etc.', 'cog', '#3b82f6'),
  ('Tools', 'Tools purchased for the project', 'tool', '#10b981'),
  ('Labor', 'Professional labor costs', 'wrench', '#f59e0b'),
  ('Materials', 'Raw materials, consumables, etc.', 'package', '#8b5cf6'),
  ('Miscellaneous', 'Other expenses', 'more-horizontal', '#6b7280')
ON CONFLICT (id) DO NOTHING;

-- Budget Items Table (Expenses)
CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  category_id UUID REFERENCES budget_categories(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL,
  estimated_amount DECIMAL(10, 2),
  date DATE NOT NULL,
  receipt_url TEXT,
  vendor VARCHAR(255),
  payment_method VARCHAR(100),
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Project Budget Settings
CREATE TABLE IF NOT EXISTS project_budgets (
  project_id UUID PRIMARY KEY REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  total_budget DECIMAL(10, 2),
  alert_threshold INTEGER DEFAULT 80, -- Percentage threshold for budget alerts
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budget Category Allocations
CREATE TABLE IF NOT EXISTS budget_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES budget_categories(id),
  allocated_amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, category_id)
);

-- Add budget_id column to vehicle_projects table if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'vehicle_projects' AND column_name = 'budget'
  ) THEN
    ALTER TABLE vehicle_projects ADD COLUMN budget DECIMAL(10, 2);
  END IF;
END $$;

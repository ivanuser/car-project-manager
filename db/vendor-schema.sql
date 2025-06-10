-- Create vendors table if it doesn't exist
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  website TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  category TEXT,
  rating INTEGER,
  notes TEXT,
  contact_name TEXT,
  contact_position TEXT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Add RLS policies for vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own vendors" 
  ON vendors FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own vendors" 
  ON vendors FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vendors" 
  ON vendors FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vendors" 
  ON vendors FOR DELETE 
  USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_vendors_updated_at
BEFORE UPDATE ON vendors
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Add vendor_id to project_parts if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'project_parts' AND column_name = 'vendor_id') THEN
    ALTER TABLE project_parts ADD COLUMN vendor_id UUID REFERENCES vendors(id);
  END IF;
END $$;

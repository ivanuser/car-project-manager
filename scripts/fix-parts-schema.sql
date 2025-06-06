-- Comprehensive fix for project_parts table schema
-- Adds missing columns for complete parts management functionality

-- Create vendors table if it doesn't exist
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  website TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  notes TEXT
);

-- Enable RLS on vendors table
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Add vendors policies if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendors' AND policyname = 'Users can view all vendors') THEN
        CREATE POLICY "Users can view all vendors" ON vendors FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendors' AND policyname = 'Authenticated users can create vendors') THEN
        CREATE POLICY "Authenticated users can create vendors" ON vendors FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendors' AND policyname = 'Authenticated users can update vendors') THEN
        CREATE POLICY "Authenticated users can update vendors" ON vendors FOR UPDATE USING (auth.uid() IS NOT NULL);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'vendors' AND policyname = 'Authenticated users can delete vendors') THEN
        CREATE POLICY "Authenticated users can delete vendors" ON vendors FOR DELETE USING (auth.uid() IS NOT NULL);
    END IF;
END $$;

-- Add vendors trigger for updated_at
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_vendors_updated_at') THEN
        CREATE TRIGGER update_vendors_updated_at
        BEFORE UPDATE ON vendors
        FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
    END IF;
END $$;

-- Add part_number column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_parts' 
                   AND column_name = 'part_number') THEN
        ALTER TABLE project_parts ADD COLUMN part_number TEXT;
    END IF;
END $$;

-- Add image_url column  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_parts' 
                   AND column_name = 'image_url') THEN
        ALTER TABLE project_parts ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- Add condition column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_parts' 
                   AND column_name = 'condition') THEN
        ALTER TABLE project_parts ADD COLUMN condition TEXT;
    END IF;
END $$;

-- Add location column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_parts' 
                   AND column_name = 'location') THEN
        ALTER TABLE project_parts ADD COLUMN location TEXT;
    END IF;
END $$;

-- Add vendor_id column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_parts' 
                   AND column_name = 'vendor_id') THEN
        ALTER TABLE project_parts ADD COLUMN vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add notes column
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'project_parts' 
                   AND column_name = 'notes') THEN
        ALTER TABLE project_parts ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Update status column to have proper check constraint if not already there
DO $$ 
BEGIN
    -- Drop existing constraint if it exists (in case it's named differently)
    IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
               WHERE table_name = 'project_parts' 
               AND column_name = 'status'
               AND constraint_name LIKE '%status%') THEN
        ALTER TABLE project_parts DROP CONSTRAINT IF EXISTS project_parts_status_check;
    END IF;
    
    -- Add the status constraint
    ALTER TABLE project_parts ADD CONSTRAINT project_parts_status_check 
        CHECK (status IN ('needed', 'ordered', 'received', 'installed', 'returned'));
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);

CREATE INDEX IF NOT EXISTS idx_project_parts_project_id ON project_parts(project_id);
CREATE INDEX IF NOT EXISTS idx_project_parts_status ON project_parts(status);
CREATE INDEX IF NOT EXISTS idx_project_parts_part_number ON project_parts(part_number);
CREATE INDEX IF NOT EXISTS idx_project_parts_vendor_id ON project_parts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_project_parts_condition ON project_parts(condition);
CREATE INDEX IF NOT EXISTS idx_project_parts_location ON project_parts(location);

-- Update any existing parts to have default values if they're NULL
UPDATE project_parts SET status = 'needed' WHERE status IS NULL;

-- Add table and column comments
COMMENT ON TABLE vendors IS 'Parts vendors and suppliers';
COMMENT ON COLUMN vendors.name IS 'Vendor name';
COMMENT ON COLUMN vendors.website IS 'Vendor website URL';
COMMENT ON COLUMN vendors.contact_email IS 'Primary contact email';
COMMENT ON COLUMN vendors.contact_phone IS 'Primary contact phone number';
COMMENT ON COLUMN vendors.notes IS 'Additional notes about the vendor';

COMMENT ON TABLE project_parts IS 'Parts associated with vehicle projects';
COMMENT ON COLUMN project_parts.part_number IS 'Manufacturer part number or SKU';
COMMENT ON COLUMN project_parts.image_url IS 'URL to part image stored in file system';
COMMENT ON COLUMN project_parts.condition IS 'Part condition: new, used, refurbished, etc.';
COMMENT ON COLUMN project_parts.location IS 'Where the part is stored';
COMMENT ON COLUMN project_parts.vendor_id IS 'Reference to vendor/supplier';
COMMENT ON COLUMN project_parts.notes IS 'Additional notes about the part';
COMMENT ON COLUMN project_parts.status IS 'Current part status: needed, ordered, received, installed, returned';

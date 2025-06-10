-- Fix vehicle_projects table schema to match application requirements
-- This script adds missing columns that the application expects

-- Add vin column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'vehicle_projects' AND column_name = 'vin'
  ) THEN
    ALTER TABLE vehicle_projects ADD COLUMN vin TEXT;
    RAISE NOTICE 'Added vin column to vehicle_projects';
  ELSE
    RAISE NOTICE 'vin column already exists in vehicle_projects';
  END IF;
END $$;

-- Add project_type column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'vehicle_projects' AND column_name = 'project_type'
  ) THEN
    ALTER TABLE vehicle_projects ADD COLUMN project_type TEXT;
    RAISE NOTICE 'Added project_type column to vehicle_projects';
  ELSE
    RAISE NOTICE 'project_type column already exists in vehicle_projects';
  END IF;
END $$;

-- Add start_date column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'vehicle_projects' AND column_name = 'start_date'
  ) THEN
    ALTER TABLE vehicle_projects ADD COLUMN start_date DATE;
    RAISE NOTICE 'Added start_date column to vehicle_projects';
  ELSE
    RAISE NOTICE 'start_date column already exists in vehicle_projects';
  END IF;
END $$;

-- Add end_date column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'vehicle_projects' AND column_name = 'end_date'
  ) THEN
    ALTER TABLE vehicle_projects ADD COLUMN end_date DATE;
    RAISE NOTICE 'Added end_date column to vehicle_projects';
  ELSE
    RAISE NOTICE 'end_date column already exists in vehicle_projects';
  END IF;
END $$;

-- Add budget column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'vehicle_projects' AND column_name = 'budget'
  ) THEN
    ALTER TABLE vehicle_projects ADD COLUMN budget DECIMAL(12, 2);
    RAISE NOTICE 'Added budget column to vehicle_projects';
  ELSE
    RAISE NOTICE 'budget column already exists in vehicle_projects';
  END IF;
END $$;

-- Add build_stage column if it doesn't exist (for future use)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'vehicle_projects' AND column_name = 'build_stage'
  ) THEN
    ALTER TABLE vehicle_projects ADD COLUMN build_stage TEXT DEFAULT 'planning';
    RAISE NOTICE 'Added build_stage column to vehicle_projects';
  ELSE
    RAISE NOTICE 'build_stage column already exists in vehicle_projects';
  END IF;
END $$;

-- Verify the schema is now complete
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns 
    WHERE table_name = 'vehicle_projects' 
    AND column_name IN ('vin', 'project_type', 'start_date', 'end_date', 'budget', 'build_stage');
    
    RAISE NOTICE 'vehicle_projects table now has % of 6 expected new columns', column_count;
    
    IF column_count = 6 THEN
        RAISE NOTICE 'vehicle_projects schema update completed successfully!';
    ELSE
        RAISE WARNING 'vehicle_projects schema update may be incomplete';
    END IF;
END $$;

-- Show current table structure for verification
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vehicle_projects' 
ORDER BY ordinal_position;

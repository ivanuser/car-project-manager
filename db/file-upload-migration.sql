-- File Upload System Migration Script
-- This script ensures all necessary tables and columns exist for the file upload functionality

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update_updated_at function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure project_photos table exists with all required columns
CREATE TABLE IF NOT EXISTS project_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID NOT NULL,
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_before_photo BOOLEAN DEFAULT FALSE,
  is_after_photo BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  taken_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'project_photos_project_id_fkey'
  ) THEN
    ALTER TABLE project_photos 
    ADD CONSTRAINT project_photos_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES vehicle_projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create photo_tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS photo_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL
);

-- Add unique constraint for photo tags
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'photo_tags_name_user_id_key'
  ) THEN
    ALTER TABLE photo_tags ADD CONSTRAINT photo_tags_name_user_id_key UNIQUE(name, user_id);
  END IF;
END $$;

-- Create photo_tag_relations table if it doesn't exist
CREATE TABLE IF NOT EXISTS photo_tag_relations (
  photo_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  PRIMARY KEY (photo_id, tag_id),
  FOREIGN KEY (photo_id) REFERENCES project_photos(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES photo_tags(id) ON DELETE CASCADE
);

-- Ensure documents table exists with all required columns
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_name TEXT NOT NULL,
  category_id UUID,
  project_id UUID,
  user_id UUID NOT NULL,
  is_public BOOLEAN DEFAULT false,
  version TEXT,
  thumbnail_url TEXT
);

-- Add foreign key constraints for documents if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'documents_project_id_fkey'
  ) THEN
    ALTER TABLE documents 
    ADD CONSTRAINT documents_project_id_fkey 
    FOREIGN KEY (project_id) REFERENCES vehicle_projects(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create document_categories table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  user_id UUID NOT NULL
);

-- Add foreign key constraint for document categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'documents_category_id_fkey'
  ) THEN
    ALTER TABLE documents 
    ADD CONSTRAINT documents_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES document_categories(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create document_tags table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL,
  UNIQUE(name, user_id)
);

-- Create document_tag_relations table if it doesn't exist
CREATE TABLE IF NOT EXISTS document_tag_relations (
  document_id UUID NOT NULL,
  tag_id UUID NOT NULL,
  PRIMARY KEY (document_id, tag_id),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES document_tags(id) ON DELETE CASCADE
);

-- Ensure budget_items table has receipt_url column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'budget_items' AND column_name = 'receipt_url'
  ) THEN
    ALTER TABLE budget_items ADD COLUMN receipt_url TEXT;
  END IF;
END $$;

-- Create triggers for updating timestamps
DO $$
BEGIN
  -- Project photos trigger
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_project_photos_updated_at'
  ) THEN
    CREATE TRIGGER update_project_photos_updated_at
    BEFORE UPDATE ON project_photos
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
  END IF;

  -- Photo tags trigger
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_photo_tags_updated_at'
  ) THEN
    CREATE TRIGGER update_photo_tags_updated_at
    BEFORE UPDATE ON photo_tags
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
  END IF;

  -- Documents trigger
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_documents_updated_at'
  ) THEN
    CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
  END IF;

  -- Document categories trigger
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_document_categories_updated_at'
  ) THEN
    CREATE TRIGGER update_document_categories_updated_at
    BEFORE UPDATE ON document_categories
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at();
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_photos_project_id ON project_photos(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_photos_category ON project_photos(category);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_project_photos_created_at ON project_photos(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_project_id ON documents(project_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_category_id ON documents(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_documents_created_at ON documents(created_at);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_budget_items_receipt_url ON budget_items(receipt_url) WHERE receipt_url IS NOT NULL;

-- Insert default document categories if they don't exist
INSERT INTO document_categories (name, description, icon, color, user_id)
SELECT 'Manuals', 'Service manuals and guides', 'book-open', '#3b82f6', 
       (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM document_categories WHERE name = 'Manuals')
AND EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO document_categories (name, description, icon, color, user_id)
SELECT 'Receipts', 'Purchase receipts and invoices', 'receipt', '#f59e0b',
       (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM document_categories WHERE name = 'Receipts')
AND EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO document_categories (name, description, icon, color, user_id)
SELECT 'Technical', 'Technical specifications and diagrams', 'cog', '#10b981',
       (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM document_categories WHERE name = 'Technical')
AND EXISTS (SELECT 1 FROM auth.users LIMIT 1);

INSERT INTO document_categories (name, description, icon, color, user_id)
SELECT 'Legal', 'Registration, insurance, and legal documents', 'file-text', '#8b5cf6',
       (SELECT id FROM auth.users LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM document_categories WHERE name = 'Legal')
AND EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Summary of changes
DO $$
BEGIN
  RAISE NOTICE 'File upload system migration completed successfully!';
  RAISE NOTICE 'Tables created/verified:';
  RAISE NOTICE '- project_photos (with metadata support)';
  RAISE NOTICE '- photo_tags and photo_tag_relations';
  RAISE NOTICE '- documents (with versioning and categorization)';
  RAISE NOTICE '- document_categories and document_tags';
  RAISE NOTICE '- document_tag_relations';
  RAISE NOTICE 'Columns added:';
  RAISE NOTICE '- budget_items.receipt_url';
  RAISE NOTICE 'Indexes and triggers created for optimal performance';
END $$;

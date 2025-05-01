-- Create document_categories table
CREATE TABLE IF NOT EXISTS document_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create documents table
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
  category_id UUID REFERENCES document_categories(id) ON DELETE SET NULL,
  project_id UUID REFERENCES vehicle_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  version TEXT,
  thumbnail_url TEXT
);

-- Create document_tags table
CREATE TABLE IF NOT EXISTS document_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(name, user_id)
);

-- Create document_tag_relations junction table
CREATE TABLE IF NOT EXISTS document_tag_relations (
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES document_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, tag_id)
);

-- Enable RLS on all tables
ALTER TABLE document_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_tag_relations ENABLE ROW LEVEL SECURITY;

-- Document categories policies
CREATE POLICY "Users can view their own document categories" 
  ON document_categories FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own document categories" 
  ON document_categories FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document categories" 
  ON document_categories FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document categories" 
  ON document_categories FOR DELETE 
  USING (auth.uid() = user_id);

-- Documents policies
CREATE POLICY "Users can view their own documents" 
  ON documents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents" 
  ON documents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own documents" 
  ON documents FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents" 
  ON documents FOR DELETE 
  USING (auth.uid() = user_id);

-- Document tags policies
CREATE POLICY "Users can view their own document tags" 
  ON document_tags FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own document tags" 
  ON document_tags FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own document tags" 
  ON document_tags FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document tags" 
  ON document_tags FOR DELETE 
  USING (auth.uid() = user_id);

-- Document tag relations policies
CREATE POLICY "Users can view their own document tag relations" 
  ON document_tag_relations FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM documents 
    WHERE documents.id = document_tag_relations.document_id 
    AND documents.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own document tag relations" 
  ON document_tag_relations FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM documents 
    WHERE documents.id = document_tag_relations.document_id 
    AND documents.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own document tag relations" 
  ON document_tag_relations FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM documents 
    WHERE documents.id = document_tag_relations.document_id 
    AND documents.user_id = auth.uid()
  ));

-- Create triggers for updating timestamps
CREATE TRIGGER update_document_categories_updated_at
BEFORE UPDATE ON document_categories
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON documents
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

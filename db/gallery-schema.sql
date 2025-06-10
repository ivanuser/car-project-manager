-- Create project_photos table
CREATE TABLE IF NOT EXISTS project_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_id UUID NOT NULL REFERENCES vehicle_projects(id) ON DELETE CASCADE,
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

-- Create photo_tags table for organizing photos
CREATE TABLE IF NOT EXISTS photo_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
);

-- Create photo_tag_relations junction table
CREATE TABLE IF NOT EXISTS photo_tag_relations (
  photo_id UUID NOT NULL REFERENCES project_photos(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES photo_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (photo_id, tag_id)
);

-- Create RLS policies
ALTER TABLE project_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE photo_tag_relations ENABLE ROW LEVEL SECURITY;

-- Project photos policies
CREATE POLICY "Users can view their own project photos" 
  ON project_photos FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_photos.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create photos for their projects" 
  ON project_photos FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_photos.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can update photos for their projects" 
  ON project_photos FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_photos.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete photos for their projects" 
  ON project_photos FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM vehicle_projects 
    WHERE vehicle_projects.id = project_photos.project_id 
    AND vehicle_projects.user_id = auth.uid()
  ));

-- Photo tags policies
CREATE POLICY "Users can view their own photo tags" 
  ON photo_tags FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own photo tags" 
  ON photo_tags FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own photo tags" 
  ON photo_tags FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own photo tags" 
  ON photo_tags FOR DELETE 
  USING (auth.uid() = user_id);

-- Photo tag relations policies
CREATE POLICY "Users can view their own photo tag relations" 
  ON photo_tag_relations FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM project_photos
    JOIN vehicle_projects ON project_photos.project_id = vehicle_projects.id
    WHERE project_photos.id = photo_tag_relations.photo_id
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can create their own photo tag relations" 
  ON photo_tag_relations FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM project_photos
    JOIN vehicle_projects ON project_photos.project_id = vehicle_projects.id
    WHERE project_photos.id = photo_tag_relations.photo_id
    AND vehicle_projects.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete their own photo tag relations" 
  ON photo_tag_relations FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM project_photos
    JOIN vehicle_projects ON project_photos.project_id = vehicle_projects.id
    WHERE project_photos.id = photo_tag_relations.photo_id
    AND vehicle_projects.user_id = auth.uid()
  ));

-- Create triggers for updating timestamps
CREATE TRIGGER update_project_photos_updated_at
BEFORE UPDATE ON project_photos
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

CREATE TRIGGER update_photo_tags_updated_at
BEFORE UPDATE ON photo_tags
FOR EACH ROW EXECUTE PROCEDURE update_updated_at();

-- Update profiles table with additional fields
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS expertise_level TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  theme TEXT DEFAULT 'system' NOT NULL,
  color_scheme TEXT DEFAULT 'default' NOT NULL,
  background_intensity TEXT DEFAULT 'medium' NOT NULL,
  ui_density TEXT DEFAULT 'comfortable' NOT NULL,
  date_format TEXT DEFAULT 'MM/DD/YYYY' NOT NULL,
  time_format TEXT DEFAULT '12h' NOT NULL,
  measurement_unit TEXT DEFAULT 'imperial' NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true, "maintenance": true, "project_updates": true}' NOT NULL,
  display_preferences JSONB DEFAULT '{"default_project_view": "grid", "default_task_view": "list", "show_completed_tasks": true}' NOT NULL
);

-- Set up RLS policies for user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON public.user_preferences
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own preferences"
  ON public.user_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own preferences"
  ON public.user_preferences
  FOR UPDATE
  USING (auth.uid() = id);

-- Create API route to update schema
CREATE OR REPLACE FUNCTION public.update_profile_schema()
RETURNS TEXT AS $$
BEGIN
  -- Update profiles table with additional fields
  ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS expertise_level TEXT,
  ADD COLUMN IF NOT EXISTS social_links JSONB,
  ADD COLUMN IF NOT EXISTS phone TEXT;

  -- Create user_preferences table if it doesn't exist
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_preferences') THEN
    CREATE TABLE public.user_preferences (
      id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
      theme TEXT DEFAULT 'system' NOT NULL,
      color_scheme TEXT DEFAULT 'default' NOT NULL,
      background_intensity TEXT DEFAULT 'medium' NOT NULL,
      ui_density TEXT DEFAULT 'comfortable' NOT NULL,
      date_format TEXT DEFAULT 'MM/DD/YYYY' NOT NULL,
      time_format TEXT DEFAULT '12h' NOT NULL,
      measurement_unit TEXT DEFAULT 'imperial' NOT NULL,
      currency TEXT DEFAULT 'USD' NOT NULL,
      notification_preferences JSONB DEFAULT '{"email": true, "push": true, "maintenance": true, "project_updates": true}' NOT NULL,
      display_preferences JSONB DEFAULT '{"default_project_view": "grid", "default_task_view": "list", "show_completed_tasks": true}' NOT NULL
    );

    -- Set up RLS policies for user_preferences
    ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can view their own preferences"
      ON public.user_preferences
      FOR SELECT
      USING (auth.uid() = id);

    CREATE POLICY "Users can insert their own preferences"
      ON public.user_preferences
      FOR INSERT
      WITH CHECK (auth.uid() = id);

    CREATE POLICY "Users can update their own preferences"
      ON public.user_preferences
      FOR UPDATE
      USING (auth.uid() = id);
  END IF;

  RETURN 'Profile schema updated successfully';
END;
$$ LANGUAGE plpgsql;

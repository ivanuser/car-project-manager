-- admin-dev-mode-fix.sql - Adds support for admin-dev-mode in development

-- Function to set up admin preferences if they don't exist
CREATE OR REPLACE FUNCTION auth.ensure_admin_preferences()
RETURNS BOOLEAN AS $$
DECLARE
  v_admin_id UUID;
BEGIN
  -- Get the admin user ID
  SELECT id INTO v_admin_id FROM auth.users
  WHERE email = 'admin@cajpro.local'
  LIMIT 1;
  
  IF v_admin_id IS NULL THEN
    RAISE NOTICE 'Admin user not found. Please run auth.seed_admin_user() first.';
    RETURN FALSE;
  END IF;
  
  -- Check if the admin user has preferences
  IF NOT EXISTS (SELECT 1 FROM public.user_preferences WHERE id = v_admin_id) THEN
    -- Insert default preferences
    INSERT INTO public.user_preferences (
      id, theme, color_scheme, background_intensity, ui_density,
      date_format, time_format, measurement_unit, currency,
      notification_preferences, display_preferences,
      created_at, updated_at
    ) VALUES (
      v_admin_id, 'system', 'default', 'medium', 'comfortable',
      'MM/DD/YYYY', '12h', 'imperial', 'USD',
      '{"email": true, "push": true, "maintenance": true, "project_updates": true}'::jsonb, 
      '{"default_project_view": "grid", "default_task_view": "list", "show_completed_tasks": true}'::jsonb,
      NOW(), NOW()
    );
    
    RAISE NOTICE 'Created default preferences for admin user';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Run the function to ensure preferences exist
SELECT auth.ensure_admin_preferences();

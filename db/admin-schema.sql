-- Admin schema for CAJPRO

-- Admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_level TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB,
  source TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permissions JSONB NOT NULL DEFAULT '[]'::JSONB,
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- API usage stats table
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL, -- in milliseconds
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System updates table
CREATE TABLE IF NOT EXISTS system_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version TEXT NOT NULL,
  update_type TEXT NOT NULL,
  description TEXT NOT NULL,
  details JSONB,
  status TEXT NOT NULL,
  installed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  installed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_updates ENABLE ROW LEVEL SECURITY;

-- Admin settings policies
CREATE POLICY admin_settings_select ON admin_settings
  FOR SELECT USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
  
CREATE POLICY admin_settings_insert ON admin_settings
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
  
CREATE POLICY admin_settings_update ON admin_settings
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
  
CREATE POLICY admin_settings_delete ON admin_settings
  FOR DELETE USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));

-- System logs policies
CREATE POLICY system_logs_select ON system_logs
  FOR SELECT USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
  
CREATE POLICY system_logs_insert ON system_logs
  FOR INSERT WITH CHECK (true);

-- API keys policies
CREATE POLICY api_keys_select ON api_keys
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
  
CREATE POLICY api_keys_insert ON api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
  
CREATE POLICY api_keys_update ON api_keys
  FOR UPDATE USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
  
CREATE POLICY api_keys_delete ON api_keys
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));

-- API usage policies
CREATE POLICY api_usage_select ON api_usage
  FOR SELECT USING (
    auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin') OR
    auth.uid() = user_id OR
    auth.uid() = (SELECT user_id FROM api_keys WHERE id = api_key_id)
  );
  
CREATE POLICY api_usage_insert ON api_usage
  FOR INSERT WITH CHECK (true);

-- System updates policies
CREATE POLICY system_updates_select ON system_updates
  FOR SELECT USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
  
CREATE POLICY system_updates_insert ON system_updates
  FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
  
CREATE POLICY system_updates_update ON system_updates
  FOR UPDATE USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));

-- auth-schema.sql - PostgreSQL schema for custom authentication
-- For Caj-pro car project build tracking application
-- Created on: May 4, 2025

-- Create schema for authentication
CREATE SCHEMA IF NOT EXISTS auth;

-- Create users table
CREATE TABLE IF NOT EXISTS auth.users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_confirmed_at TIMESTAMP WITH TIME ZONE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS auth.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ip_address TEXT,
  user_agent TEXT
);

-- Create password_reset_tokens table
CREATE TABLE IF NOT EXISTS auth.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create email_confirmation_tokens table
CREATE TABLE IF NOT EXISTS auth.email_confirmation_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create refresh_tokens table
CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Create function to get current authenticated user ID (will be implemented via JWT validation)
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS UUID AS $$
BEGIN
  -- This will be replaced by the actual JWT validation logic in the application
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamp
CREATE OR REPLACE FUNCTION auth.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_auth_users_updated_at
BEFORE UPDATE ON auth.users
FOR EACH ROW EXECUTE FUNCTION auth.update_updated_at();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON auth.sessions(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON auth.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON auth.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_confirmation_tokens_user_id ON auth.email_confirmation_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_confirmation_tokens_token ON auth.email_confirmation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON auth.refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON auth.refresh_tokens(token);

-- Create utility functions for authentication

-- Function to create a new user
CREATE OR REPLACE FUNCTION auth.create_user(
  p_email TEXT,
  p_password_hash TEXT,
  p_salt TEXT,
  p_is_admin BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  INSERT INTO auth.users (email, password_hash, salt, is_admin)
  VALUES (p_email, p_password_hash, p_salt, p_is_admin)
  RETURNING id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create a new session
CREATE OR REPLACE FUNCTION auth.create_session(
  p_user_id UUID,
  p_token TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_session_id UUID;
BEGIN
  INSERT INTO auth.sessions (user_id, token, expires_at, ip_address, user_agent)
  VALUES (p_user_id, p_token, p_expires_at, p_ip_address, p_user_agent)
  RETURNING id INTO v_session_id;
  
  -- Update last sign in time
  UPDATE auth.users
  SET last_sign_in_at = NOW()
  WHERE id = p_user_id;
  
  RETURN v_session_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate a session
CREATE OR REPLACE FUNCTION auth.validate_session(p_token TEXT)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  is_admin BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.is_admin
  FROM auth.sessions s
  JOIN auth.users u ON s.user_id = u.id
  WHERE s.token = p_token
    AND s.expires_at > NOW()
    AND u.is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to invalidate a session
CREATE OR REPLACE FUNCTION auth.invalidate_session(p_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  DELETE FROM auth.sessions
  WHERE token = p_token
  RETURNING 1 INTO v_count;
  
  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to create a password reset token
CREATE OR REPLACE FUNCTION auth.create_password_reset_token(
  p_user_id UUID,
  p_token TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS UUID AS $$
DECLARE
  v_token_id UUID;
BEGIN
  INSERT INTO auth.password_reset_tokens (user_id, token, expires_at)
  VALUES (p_user_id, p_token, p_expires_at)
  RETURNING id INTO v_token_id;
  
  RETURN v_token_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate a password reset token
CREATE OR REPLACE FUNCTION auth.validate_password_reset_token(p_token TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT user_id INTO v_user_id
  FROM auth.password_reset_tokens
  WHERE token = p_token
    AND expires_at > NOW()
    AND used_at IS NULL;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to use a password reset token
CREATE OR REPLACE FUNCTION auth.use_password_reset_token(p_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE auth.password_reset_tokens
  SET used_at = NOW()
  WHERE token = p_token
    AND expires_at > NOW()
    AND used_at IS NULL
  RETURNING 1 INTO v_count;
  
  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to create an email confirmation token
CREATE OR REPLACE FUNCTION auth.create_email_confirmation_token(
  p_user_id UUID,
  p_token TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS UUID AS $$
DECLARE
  v_token_id UUID;
BEGIN
  INSERT INTO auth.email_confirmation_tokens (user_id, token, expires_at)
  VALUES (p_user_id, p_token, p_expires_at)
  RETURNING id INTO v_token_id;
  
  RETURN v_token_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and use an email confirmation token
CREATE OR REPLACE FUNCTION auth.confirm_email(p_token TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_id UUID;
  v_count INTEGER;
BEGIN
  -- Get user ID from token
  SELECT user_id INTO v_user_id
  FROM auth.email_confirmation_tokens
  WHERE token = p_token
    AND expires_at > NOW()
    AND used_at IS NULL;
  
  IF v_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Mark token as used
  UPDATE auth.email_confirmation_tokens
  SET used_at = NOW()
  WHERE token = p_token;
  
  -- Update user's email_confirmed_at
  UPDATE auth.users
  SET email_confirmed_at = NOW()
  WHERE id = v_user_id
  RETURNING 1 INTO v_count;
  
  RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Function to create a refresh token
CREATE OR REPLACE FUNCTION auth.create_refresh_token(
  p_user_id UUID,
  p_token TEXT,
  p_expires_at TIMESTAMP WITH TIME ZONE
)
RETURNS UUID AS $$
DECLARE
  v_token_id UUID;
BEGIN
  INSERT INTO auth.refresh_tokens (user_id, token, expires_at)
  VALUES (p_user_id, p_token, p_expires_at)
  RETURNING id INTO v_token_id;
  
  RETURN v_token_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate and use a refresh token
CREATE OR REPLACE FUNCTION auth.use_refresh_token(p_token TEXT)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID from token and mark as used
  UPDATE auth.refresh_tokens
  SET used_at = NOW()
  WHERE token = p_token
    AND expires_at > NOW()
    AND used_at IS NULL
  RETURNING user_id INTO v_user_id;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

-- Create seed data function for testing (admin user)
CREATE OR REPLACE FUNCTION auth.seed_admin_user()
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_email TEXT := 'admin@cajpro.local';
  -- Password: admin123 (this is just for development; should be changed in production)
  v_password_hash TEXT := '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'; -- SHA-256 hash of 'password'
  v_salt TEXT := 'developmentsalt';
BEGIN
  -- Check if admin user already exists
  SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;
  
  IF v_user_id IS NULL THEN
    -- Create admin user
    INSERT INTO auth.users (email, password_hash, salt, is_admin, email_confirmed_at)
    VALUES (v_email, v_password_hash, v_salt, TRUE, NOW())
    RETURNING id INTO v_user_id;
    
    RAISE NOTICE 'Created admin user with email: %', v_email;
  ELSE
    RAISE NOTICE 'Admin user already exists with email: %', v_email;
  END IF;
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;

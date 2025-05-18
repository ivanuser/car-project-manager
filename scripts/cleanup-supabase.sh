#!/bin/bash

# Supabase Cleanup Script
# This script removes all Supabase dependencies and references

echo "Starting Supabase cleanup..."

# Remove Supabase package
npm uninstall @supabase/supabase-js

# Create a backup of the supabase.ts file in case we need it later
if [ -f "lib/supabase.ts" ]; then
  mkdir -p deprecated
  cp lib/supabase.ts deprecated/supabase.ts.bak
  echo "Backed up lib/supabase.ts to deprecated/supabase.ts.bak"
fi

# Remove the test API route (or keep it as a PostgreSQL test)
if [ -d "app/api/supabase-test" ]; then
  echo "Keeping app/api/supabase-test with PostgreSQL version"
fi

# Rename the types file
if [ -f "types/supabase.ts" ]; then
  mkdir -p deprecated
  cp types/supabase.ts deprecated/supabase.ts.bak
  echo "Backed up types/supabase.ts to deprecated/supabase.ts.bak"
fi

# Remove env vars
if [ -f ".env.local" ]; then
  # Create a backup
  cp .env.local .env.local.bak
  
  # Remove Supabase env vars but keep the file
  sed -i '/NEXT_PUBLIC_SUPABASE_URL/d' .env.local
  sed -i '/NEXT_PUBLIC_SUPABASE_ANON_KEY/d' .env.local
  sed -i '/SUPABASE_SERVICE_ROLE_KEY/d' .env.local
  
  echo "Removed Supabase environment variables from .env.local"
fi

echo "Supabase cleanup complete."
echo "Note: You should run a full build to check for any remaining references."

-- CAJPRO Database Initialization Script
-- Run this file to initialize all database tables in the correct order

-- Record start time for tracking
\echo 'Starting database initialization...'
\set start_time 'now()'

-- Create extension for UUID generation if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Load all schema files in correct dependency order
\echo 'Loading schema.sql - Base tables'
\ir schema.sql

\echo 'Loading profile-schema.sql - User profiles'
\ir profile-schema.sql

\echo 'Loading budget-schema.sql - Budget management'
\ir budget-schema.sql

\echo 'Loading expense-schema.sql - Expense reports'
\ir expense-schema.sql

\echo 'Loading gallery-schema.sql - Photo gallery'
\ir gallery-schema.sql

\echo 'Loading documentation-schema.sql - Document storage'
\ir documentation-schema.sql

\echo 'Loading timeline-schema.sql - Timeline tracking'
\ir timeline-schema.sql

\echo 'Loading maintenance-schema.sql - Maintenance records'
\ir maintenance-schema.sql

\echo 'Loading vendor-schema.sql - Vendor management'
\ir vendor-schema.sql

-- Show execution time
\echo 'Database initialization completed!'
\echo 'Execution time:'
SELECT (now() - :'start_time') AS execution_time;

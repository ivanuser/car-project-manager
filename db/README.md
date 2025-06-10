# Database Schema Setup Instructions

This directory contains SQL files for setting up the PostgreSQL database schema for the Caj-pro application.

## Schema Execution Order

For proper initialization, execute the SQL files in the following order:

1. `schema.sql` - Creates the base tables (profiles, vehicle_projects, project_tasks, project_parts)
2. `profile-schema.sql` - Extends the profile schema with additional fields and preferences
3. `budget-schema.sql` - Adds budget categories, items, and allocations
4. `expense-schema.sql` - Creates expense reports and related tables
5. `gallery-schema.sql` - Adds project photos and related tables
6. `documentation-schema.sql` - Adds document storage
7. `timeline-schema.sql` - Adds timeline and milestone tracking
8. `vendor-schema.sql` - Adds vendor management
9. `maintenance-schema.sql` - Adds maintenance records
10. `admin-schema.sql` - Adds admin-specific functionality (if needed)

## Installation

### Using Supabase Dashboard SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to the SQL Editor
3. Create a new query
4. Copy and paste the contents of each SQL file in the order listed above
5. Execute each query individually
6. Check that each query executes successfully before proceeding to the next

### Schema Update

If you need to update an existing database, use:

```sql
-- Run schema-update.sql to safely update the schema without data loss
```

## Troubleshooting Common Issues

- **Dependency Errors**: If you see errors about missing tables or relations, make sure you're executing the SQL files in the proper order.
- **Policy Already Exists**: If policies already exist, the scripts use `IF NOT EXISTS` checks to avoid errors.
- **Invalid References**: Make sure all referenced tables exist before running a script that depends on them.

## Table Relationships

The database schema follows these primary relationships:

- `profiles` - User accounts (linked to Supabase auth.users)
- `vehicle_projects` - Main projects table (belongs to a profile)
- `project_tasks` - Tasks for projects (belongs to a project)
- `project_parts` - Parts for projects (belongs to a project)
- `budget_items` - Budget/expense items (belongs to a project)
- `project_photos` - Photo gallery (belongs to a project)
- And more specialized tables documented in their respective files

Each table has appropriate Row Level Security (RLS) policies applied to ensure users can only access their own data.

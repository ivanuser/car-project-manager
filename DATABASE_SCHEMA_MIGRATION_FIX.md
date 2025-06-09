# Database Schema Migration Fix

## Issue Identified

**Error**: `column "expertise_level" does not exist`

### Root Cause
The `profiles` table was created with an older schema that's missing several columns that the new profile editing functionality expects. This happened because:

1. **Table Created Earlier**: The profiles table exists but was created before the full schema was defined
2. **Schema Evolution**: New columns were added to the schema but not migrated to existing tables
3. **API Mismatch**: The profile API expects columns that don't exist in the database

### Specific Missing Columns
- `expertise_level` 
- `user_id` (for proper foreign key relationship)
- Other potential missing fields like `phone`, `website`, etc.

## Complete Migration Solution

### 1. Database Migration API (`/api/debug/migrate-tables`)

**Purpose**: Safely migrate existing tables to the latest schema without data loss.

**Features**:
- ✅ **Non-destructive**: Adds missing columns without dropping existing data
- ✅ **Smart Detection**: Checks what columns already exist before making changes
- ✅ **Comprehensive**: Handles both `profiles` and `user_preferences` tables
- ✅ **Safe Constraints**: Adds foreign key relationships and indexes
- ✅ **Detailed Logging**: Reports exactly what changes were made

**Migration Process**:
```sql
-- Example: Add missing expertise_level column
ALTER TABLE profiles ADD COLUMN expertise_level TEXT DEFAULT 'beginner';

-- Example: Add missing user_id foreign key
ALTER TABLE profiles ADD COLUMN user_id UUID NOT NULL;
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
```

### 2. Resilient Profile API

**Enhanced Error Handling**:
- ✅ **Column Detection**: Checks what columns exist before querying
- ✅ **Dynamic Queries**: Builds SELECT/UPDATE queries based on available columns
- ✅ **Graceful Fallbacks**: Handles missing columns without crashing
- ✅ **Safe Defaults**: Returns reasonable defaults for missing data

**Example Dynamic Query Building**:
```typescript
// ✅ NEW: Check available columns first
const availableColumns = await getTableColumns('profiles');

// ✅ NEW: Only query columns that exist
const safeColumns = desiredColumns.filter(col => availableColumns.includes(col));
const query = `SELECT ${safeColumns.join(', ')} FROM profiles WHERE user_id = $1`;
```

### 3. Enhanced Database Debug Component

**New Migration Features**:
- ✅ **Migration Detection**: Identifies when schema migration is needed
- ✅ **Migration Button**: "Migrate Schema" button for easy one-click fixes
- ✅ **Progress Feedback**: Shows exactly what changes were made
- ✅ **Status Updates**: Refreshes table status after migration

## How to Fix the Current Issue

### Step 1: Use the Migration Tool

1. **Navigate to Settings**: Go to your settings page
2. **Scroll to Development Tools**: Find the "Database Status" section
3. **Click "Migrate Schema"**: This will analyze and fix your table structure
4. **Wait for Success**: You'll see a detailed report of changes made

### Step 2: Verify the Fix

1. **Check Database Status**: Tables should show as properly configured
2. **Test Profile Editing**: Navigate to Profile page - should work without errors
3. **Verify Column Existence**: Debug info will show all required columns present

### Step 3: Test Full Functionality

1. **Edit Profile**: Add your name, bio, location, expertise level
2. **Save Changes**: Should save successfully without errors
3. **Refresh Page**: Changes should persist properly

## Expected Migration Results

### Database Changes Made:
```sql
-- Profiles table migration
ALTER TABLE profiles ADD COLUMN user_id UUID NOT NULL;
ALTER TABLE profiles ADD COLUMN expertise_level TEXT DEFAULT 'beginner';
ALTER TABLE profiles ADD COLUMN phone TEXT DEFAULT '';
ALTER TABLE profiles ADD COLUMN website TEXT DEFAULT '';
-- ... other missing columns

-- Add constraints and indexes
ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
```

### API Improvements:
- ✅ **No More Column Errors**: API dynamically adapts to available columns
- ✅ **Graceful Degradation**: Missing columns don't crash the application
- ✅ **Future-Proof**: New columns can be added without breaking existing functionality

## Files Created/Modified

### New Migration System:
1. **`/api/debug/migrate-tables/route.ts`** - Database migration endpoint
2. **Enhanced `/components/debug/db-debug.tsx`** - Added migration button and status
3. **Enhanced `/api/user/profile/route.ts`** - Resilient column detection

### Migration Benefits:
- ✅ **Zero Downtime**: Migration runs without stopping the application
- ✅ **Data Preservation**: All existing data is kept safe
- ✅ **Automatic Detection**: Knows exactly what needs to be migrated
- ✅ **Detailed Reporting**: Shows exactly what was changed

## Prevention for Future

### Schema Evolution Best Practices:
1. **Migration First**: Always create migration scripts for schema changes
2. **Backward Compatibility**: Ensure APIs can handle missing columns gracefully
3. **Version Control**: Track schema changes with version numbers
4. **Testing**: Test migrations on development data before production

### Monitoring:
- **Database Debug Tool**: Regular checks of table structure and health
- **Error Logging**: Profile API now logs detailed column availability information
- **Migration History**: Track what migrations have been applied

The migration system ensures that your database schema can evolve safely over time without breaking existing functionality or losing data.

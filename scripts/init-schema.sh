#!/bin/bash

# init-schema.sh - Script to initialize PostgreSQL schema for Caj-pro
# For Caj-pro car project build tracking application
# Created on: May 4, 2025

echo "===================================="
echo "Initializing PostgreSQL schema for Caj-pro"
echo "===================================="

# Database configuration
if [ -f "../db/connection-info.txt" ]; then
    source "../db/connection-info.txt"
else
    # Default configuration if the file doesn't exist
    DB_NAME="cajpro"
    DB_USER="cajpro"
    DB_PASSWORD="CAJPRO2025"
    DB_HOST="localhost"
    DB_PORT="5432"
fi

PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)
echo "Project directory: $PROJECT_DIR"

# Initialize schema
echo "Initializing database schema..."

# First, run the auth schema (our new custom authentication system)
echo "Creating authentication schema..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$PROJECT_DIR/db/auth-schema.sql"

if [ $? -ne 0 ]; then
    echo "Failed to create authentication schema."
    exit 1
fi

# Modify the existing schema.sql file to work with our new auth system
echo "Converting schema.sql to work with custom authentication..."

# Create a temporary modified schema file
TMP_SCHEMA_FILE="$PROJECT_DIR/db/schema-modified.sql"

# First, grab the content of the existing schema file
cat "$PROJECT_DIR/db/schema.sql" > "$TMP_SCHEMA_FILE"

# Replace references to auth.users with our new auth schema
sed -i 's/auth\.users/auth\.users/g' "$TMP_SCHEMA_FILE"

# Uncomment the following if needed to replace more patterns
# sed -i 's/auth\.uid()/auth\.uid()/g' "$TMP_SCHEMA_FILE"

# Now run the modified schema
echo "Creating application schema..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$TMP_SCHEMA_FILE"

if [ $? -ne 0 ]; then
    echo "Failed to create application schema."
    rm "$TMP_SCHEMA_FILE"
    exit 1
fi

# Clean up the temporary file
rm "$TMP_SCHEMA_FILE"

# Run all other schema files
echo "Creating additional schemas..."
for schema_file in "$PROJECT_DIR/db/"*-schema.sql; do
    # Skip the auth-schema.sql (already processed) and any files that don't exist
    if [[ "$schema_file" != *"auth-schema.sql"* ]] && [ -f "$schema_file" ]; then
        echo "Running schema file: $schema_file"
        PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$schema_file"
        
        if [ $? -ne 0 ]; then
            echo "Failed to run schema file: $schema_file"
            exit 1
        fi
    fi
done

# Run procedures.sql if it exists
if [ -f "$PROJECT_DIR/db/procedures.sql" ]; then
    echo "Creating database procedures..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$PROJECT_DIR/db/procedures.sql"
    
    if [ $? -ne 0 ]; then
        echo "Failed to create database procedures."
        exit 1
    fi
fi

# Create admin user for testing
echo "Creating admin user for testing..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT auth.seed_admin_user();"

echo ""
echo "===================================="
echo "PostgreSQL Schema Initialization Complete"
echo "===================================="
echo "The database has been successfully initialized with the following schemas:"
echo "1. Authentication schema (auth-schema.sql)"
echo "2. Application schema (schema.sql with modifications)"
echo "3. Additional schema files"
echo "4. Database procedures (if available)"
echo ""
echo "Admin user for testing:"
echo "Email: admin@cajpro.local"
echo "Password: admin123"
echo ""
echo "Next steps:"
echo "1. Run update-env.sh to update environment variables"
echo ""

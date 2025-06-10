#!/bin/bash

# create-user.sh - Script to manually create a user in the database
# For Caj-pro car project build tracking application
# Created on: May 4, 2025

echo "===================================="
echo "Creating user account in PostgreSQL for Caj-pro"
echo "===================================="

# Get database connection parameters
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

# Get input parameters or use defaults
read -p "Enter email (default: admin@cajpro.local): " EMAIL
EMAIL=${EMAIL:-admin@cajpro.local}

read -p "Enter password (default: admin123): " PASSWORD
PASSWORD=${PASSWORD:-admin123}

read -p "Make admin? (y/n, default: y): " MAKE_ADMIN
MAKE_ADMIN=${MAKE_ADMIN:-y}

IS_ADMIN="false"
if [ "$MAKE_ADMIN" = "y" ] || [ "$MAKE_ADMIN" = "Y" ]; then
    IS_ADMIN="true"
fi

# Generate salt and hash the password
SALT=$(openssl rand -hex 8)
PASSWORD_HASH=$(echo -n "${PASSWORD}${SALT}" | sha256sum | awk '{print $1}')

# Create user in the database
USER_QUERY="INSERT INTO auth.users (email, password_hash, salt, is_admin, email_confirmed_at) 
            VALUES ('$EMAIL', '$PASSWORD_HASH', '$SALT', $IS_ADMIN, NOW())
            ON CONFLICT (email) 
            DO UPDATE SET 
              password_hash = EXCLUDED.password_hash,
              salt = EXCLUDED.salt,
              is_admin = EXCLUDED.is_admin,
              email_confirmed_at = NOW(),
              updated_at = NOW()
            RETURNING id;"

echo "Creating user in the database..."
USER_ID=$(PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "$USER_QUERY")

# Trim whitespace from user ID
USER_ID=$(echo $USER_ID | xargs)

if [ -z "$USER_ID" ]; then
    echo "Error: Failed to create or update user."
    exit 1
fi

echo "User created/updated successfully with ID: $USER_ID"

# Create profile for the user
PROFILE_QUERY="INSERT INTO profiles (id, full_name, created_at, updated_at) 
               VALUES ('$USER_ID', '$(echo $EMAIL | cut -d@ -f1)', NOW(), NOW())
               ON CONFLICT (id) 
               DO NOTHING;"

echo "Creating profile for the user..."
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$PROFILE_QUERY"

echo ""
echo "===================================="
echo "User Account Creation Complete"
echo "===================================="
echo "Email: $EMAIL"
echo "Password: $PASSWORD"
echo "Admin: $IS_ADMIN"
echo "User ID: $USER_ID"
echo ""
echo "You can now login with these credentials."
echo "===================================="

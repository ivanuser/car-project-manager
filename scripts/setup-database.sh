#!/bin/bash

# setup-database.sh - Script to create PostgreSQL database and user for Caj-pro
# For Caj-pro car project build tracking application
# Created on: May 4, 2025

echo "===================================="
echo "Setting up PostgreSQL database for Caj-pro"
echo "===================================="

# Database configuration
DB_NAME="cajpro"
DB_USER="cajpro"
DB_PASSWORD="22@@jesusistheLORD"
DB_HOST="localhost"
DB_PORT="5432"

# Function to check if user or database exists
check_exists() {
    local type=$1
    local name=$2
    
    if [[ "$type" == "user" ]]; then
        sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$name'" | grep -q 1
        return $?
    elif [[ "$type" == "database" ]]; then
        sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$name'" | grep -q 1
        return $?
    fi
    return 1
}

# Create user if it doesn't exist
if check_exists "user" "$DB_USER"; then
    echo "User '$DB_USER' already exists. Skipping user creation."
else
    echo "Creating user '$DB_USER'..."
    sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';"
    sudo -u postgres psql -c "ALTER USER $DB_USER WITH SUPERUSER;"
    
    if [ $? -eq 0 ]; then
        echo "User '$DB_USER' created successfully."
    else
        echo "Failed to create user '$DB_USER'."
        exit 1
    fi
fi

# Create database if it doesn't exist
if check_exists "database" "$DB_NAME"; then
    echo "Database '$DB_NAME' already exists. Skipping database creation."
else
    echo "Creating database '$DB_NAME'..."
    sudo -u postgres psql -c "CREATE DATABASE $DB_NAME WITH OWNER = $DB_USER ENCODING = 'UTF8' LC_COLLATE = 'en_US.UTF-8' LC_CTYPE = 'en_US.UTF-8' TEMPLATE template0;"
    
    if [ $? -eq 0 ]; then
        echo "Database '$DB_NAME' created successfully."
    else
        echo "Failed to create database '$DB_NAME'."
        exit 1
    fi
fi

# Enable UUID extension
echo "Enabling UUID extension..."
sudo -u postgres psql -d $DB_NAME -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

# Update PostgreSQL configuration to allow password authentication for the user
PG_HBA_CONF=$(sudo -u postgres psql -t -P format=unaligned -c "SHOW hba_file;")
echo "PostgreSQL hba_file location: $PG_HBA_CONF"

# Display connection information
echo ""
echo "===================================="
echo "PostgreSQL Database Setup Complete"
echo "===================================="
echo "Database Name: $DB_NAME"
echo "Username: $DB_USER"
echo "Password: $DB_PASSWORD"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Connection String: postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
echo ""
echo "Next steps:"
echo "1. Run init-schema.sh to initialize the database schema"
echo ""

# Save connection information to a file for later use
echo "# PostgreSQL Connection Information" > ../db/connection-info.txt
echo "DB_NAME=$DB_NAME" >> ../db/connection-info.txt
echo "DB_USER=$DB_USER" >> ../db/connection-info.txt
echo "DB_PASSWORD=$DB_PASSWORD" >> ../db/connection-info.txt
echo "DB_HOST=$DB_HOST" >> ../db/connection-info.txt
echo "DB_PORT=$DB_PORT" >> ../db/connection-info.txt
echo "CONNECTION_STRING=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" >> ../db/connection-info.txt

echo "Connection information saved to db/connection-info.txt"

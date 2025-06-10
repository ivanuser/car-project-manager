#!/bin/bash

# setup-all.sh - Master script to run all setup scripts for Caj-pro
# For Caj-pro car project build tracking application
# Created on: May 4, 2025

echo "===================================="
echo "Setting up Caj-pro car project build tracking application"
echo "===================================="

# Change to the script directory
SCRIPT_DIR=$(dirname "$0")
cd "$SCRIPT_DIR"

# Make all scripts executable
chmod +x *.sh

# Step 1: Install PostgreSQL
echo "Step 1: Installing PostgreSQL..."
./install-postgres.sh

if [ $? -ne 0 ]; then
    echo "PostgreSQL installation failed. Please check the error messages and try again."
    exit 1
fi

# Step 2: Setup Database
echo ""
echo "Step 2: Setting up the database..."
./setup-database.sh

if [ $? -ne 0 ]; then
    echo "Database setup failed. Please check the error messages and try again."
    exit 1
fi

# Step 3: Initialize Schema
echo ""
echo "Step 3: Initializing the database schema..."
./init-schema.sh

if [ $? -ne 0 ]; then
    echo "Schema initialization failed. Please check the error messages and try again."
    exit 1
fi

# Step 4: Update Environment Variables
echo ""
echo "Step 4: Updating environment variables..."
./update-env.sh

if [ $? -ne 0 ]; then
    echo "Environment variable update failed. Please check the error messages and try again."
    exit 1
fi

echo ""
echo "===================================="
echo "Caj-pro Setup Complete"
echo "===================================="
echo "The Caj-pro car project build tracking application has been successfully set up."
echo ""
echo "Next steps:"
echo "1. Navigate to the project directory: cd .."
echo "2. Install Node.js dependencies: npm install (or yarn install)"
echo "3. Start the development server: npm run dev (or yarn dev)"
echo "4. Access the application at: http://localhost:3000"
echo ""
echo "Admin login (for testing):"
echo "Email: admin@cajpro.local"
echo "Password: admin123"
echo ""
echo "Enjoy using Caj-pro!"
echo "===================================="

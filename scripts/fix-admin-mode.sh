#!/bin/bash

# Fix Admin Dev Mode Script
# This script runs the TypeScript fix script to ensure admin preferences work correctly

# Change to the project directory
cd "$(dirname "$0")/.."

# Ensure dependencies are installed
npm install

# Run the migration script with ts-node
echo "Running fix-admin-dev-mode script..."
npx ts-node scripts/fix-admin-dev-mode.ts

# Check if the script ran successfully
if [ $? -eq 0 ]; then
  echo "Admin dev mode fix completed successfully"
else
  echo "Failed to run admin dev mode fix"
  exit 1
fi

echo "You can now restart your application server"

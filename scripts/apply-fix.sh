#!/bin/bash

# Apply Admin Dev Mode Fix
# This script runs the TypeScript fix script using the application's database connection

# Change to the project directory
cd "$(dirname "$0")/.."

# Ensure dependencies are installed
npm install

# Run the application-based fix script
echo "Running apply-fix script..."
npx ts-node scripts/apply-fix.ts

# Check if the script ran successfully
if [ $? -eq 0 ]; then
  echo "Admin dev mode fix completed successfully"
else
  echo "Failed to apply admin dev mode fix"
  exit 1
fi

echo "You can now restart your application server"

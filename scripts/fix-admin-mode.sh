#!/bin/bash

# Fix Admin Dev Mode Script (JavaScript version)
# This script runs the JavaScript fix script to ensure admin preferences work correctly

# Change to the project directory
cd "$(dirname "$0")/.."

# Ensure dependencies are installed
npm install pg dotenv

# Run the JavaScript fix script
echo "Running fix-admin-dev-mode.js script..."
node scripts/fix-admin-dev-mode.js

# Check if the script ran successfully
if [ $? -eq 0 ]; then
  echo "Admin dev mode fix completed successfully"
else
  echo "Failed to run admin dev mode fix"
  exit 1
fi

echo "You can now restart your application server"

#!/bin/bash

# install-deps.sh - Script to install missing dependencies
# For Caj-pro car project build tracking application
# Created on: May 4, 2025

echo "===================================="
echo "Installing missing dependencies for Caj-pro"
echo "===================================="

# Navigate to the project directory
cd "$(dirname "$0")/.."
PROJECT_DIR=$(pwd)
echo "Project directory: $PROJECT_DIR"

# Install null-loader
echo "Installing null-loader..."
npm install --save-dev null-loader

# Install server-only package
echo "Installing server-only package..."
npm install server-only

# Update database-related packages
echo "Installing PostgreSQL-related packages..."
npm install --save pg
npm install --save-dev @types/pg

echo ""
echo "===================================="
echo "Dependencies Installation Complete"
echo "===================================="
echo "The following dependencies have been installed:"
echo "1. null-loader - For handling Cloudflare modules"
echo "2. server-only - For marking server-only code"
echo "3. pg - PostgreSQL client"
echo "4. @types/pg - TypeScript types for PostgreSQL client"
echo ""
echo "Next steps:"
echo "1. Clear Next.js cache: rm -rf .next"
echo "2. Start the application: npm run dev"
echo ""

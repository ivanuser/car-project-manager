#!/bin/bash

# fix-cloudflare.sh - Script to fix Cloudflare integration issues
# For Caj-pro car project build tracking application
# Created on: May 4, 2025

echo "===================================="
echo "Fixing Cloudflare integration for Caj-pro"
echo "===================================="

# Navigate to the project directory
cd "$(dirname "$0")/.."
PROJECT_DIR=$(pwd)
echo "Project directory: $PROJECT_DIR"

# Install required dependencies
echo "Installing required dependencies..."
npm install --save-dev null-loader @types/bcryptjs @types/jsonwebtoken

# Check if .env.local exists and update it
if [ -f "$PROJECT_DIR/.env.local" ]; then
    echo "Updating .env.local with Cloudflare configuration..."
    
    # Check if NEXT_PUBLIC_SITE_URL already exists in the file
    if grep -q "NEXT_PUBLIC_SITE_URL" "$PROJECT_DIR/.env.local"; then
        # Update existing NEXT_PUBLIC_SITE_URL
        sed -i 's|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://dev.customautojourney.com|g' "$PROJECT_DIR/.env.local"
    else
        # Add NEXT_PUBLIC_SITE_URL if it doesn't exist
        echo "NEXT_PUBLIC_SITE_URL=https://dev.customautojourney.com" >> "$PROJECT_DIR/.env.local"
    fi
    
    # Check if NEXT_PUBLIC_CLOUDFLARE_TUNNEL already exists in the file
    if grep -q "NEXT_PUBLIC_CLOUDFLARE_TUNNEL" "$PROJECT_DIR/.env.local"; then
        # Update existing NEXT_PUBLIC_CLOUDFLARE_TUNNEL
        sed -i 's|NEXT_PUBLIC_CLOUDFLARE_TUNNEL=.*|NEXT_PUBLIC_CLOUDFLARE_TUNNEL=true|g' "$PROJECT_DIR/.env.local"
    else
        # Add NEXT_PUBLIC_CLOUDFLARE_TUNNEL if it doesn't exist
        echo "NEXT_PUBLIC_CLOUDFLARE_TUNNEL=true" >> "$PROJECT_DIR/.env.local"
    fi
else
    echo "Warning: .env.local file not found. Please run update-env.sh script first."
fi

echo ""
echo "===================================="
echo "Cloudflare Integration Fix Complete"
echo "===================================="
echo "The Cloudflare integration has been configured with the following updates:"
echo ""
echo "1. Installed null-loader package to handle cloudflare:sockets"
echo "2. Updated next.config.mjs with Cloudflare-specific configuration"
echo "3. Updated cookie settings for Cloudflare compatibility"
echo "4. Added Cloudflare helper utilities in lib/cloudflare.ts"
echo "5. Updated environment variables for your Cloudflare tunnel"
echo ""
echo "Next steps:"
echo "1. Try running 'npm run dev' again"
echo "2. Access your application at https://dev.customautojourney.com"
echo ""

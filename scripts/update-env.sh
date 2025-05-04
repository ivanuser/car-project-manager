#!/bin/bash

# update-env.sh - Script to update environment variables for Caj-pro
# For Caj-pro car project build tracking application
# Created on: May 4, 2025

echo "===================================="
echo "Updating environment variables for Caj-pro"
echo "===================================="

PROJECT_DIR=$(cd "$(dirname "$0")/.." && pwd)
ENV_FILE="$PROJECT_DIR/.env.local"

# Database configuration
if [ -f "$PROJECT_DIR/db/connection-info.txt" ]; then
    source "$PROJECT_DIR/db/connection-info.txt"
else
    # Default configuration if the file doesn't exist
    DB_NAME="cajpro"
    DB_USER="cajpro"
    DB_PASSWORD="CAJPRO2025"
    DB_HOST="localhost"
    DB_PORT="5432"
    CONNECTION_STRING="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
fi

# Check if .env.local already exists
if [ -f "$ENV_FILE" ]; then
    echo "Backing up existing .env.local file..."
    cp "$ENV_FILE" "$ENV_FILE.bak"
    echo "Backup created at $ENV_FILE.bak"
fi

# Create new .env.local file
echo "Creating new .env.local file..."

cat > "$ENV_FILE" << EOF
# Environment variables for Caj-pro
# Generated on: $(date)

# PostgreSQL Database Configuration
DATABASE_URL=$CONNECTION_STRING
POSTGRES_USER=$DB_USER
POSTGRES_PASSWORD=$DB_PASSWORD
POSTGRES_DB=$DB_NAME
POSTGRES_HOST=$DB_HOST
POSTGRES_PORT=$DB_PORT

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# JWT Configuration
# Generate a secure JWT secret with: openssl rand -base64 32
JWT_SECRET=$(openssl rand -base64 32)
# JWT expiration time in seconds (default: 1 hour)
JWT_EXPIRATION=3600
# Refresh token expiration time in seconds (default: 7 days)
REFRESH_TOKEN_EXPIRATION=604800

# Email Configuration
# Set these values for email sending functionality
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=user@example.com
EMAIL_SERVER_PASSWORD=your_email_password
EMAIL_FROM=noreply@cajpro.com

# Storage Configuration
# For local development, this is the default path for file storage
STORAGE_PATH=$PROJECT_DIR/storage
# Set to "true" to use server file system storage (default), "false" to use cloud storage (future)
USE_SERVER_STORAGE=true
# Maximum storage per user in bytes (default: 5GB = 5368709120 bytes)
MAX_USER_STORAGE=5368709120

# Security Configuration
# Number of rounds for bcrypt hashing (higher is more secure but slower)
BCRYPT_SALT_ROUNDS=10
# Rate limiting settings (requests per minute)
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=60000

# Database Initialization
# Set to "true" to enable database initialization on startup (development only)
INITIALIZE_DB=false
EOF

echo "Environment variables updated successfully."
echo "New .env.local file created at $ENV_FILE"

# Create storage directory if it doesn't exist
STORAGE_DIR="$PROJECT_DIR/storage"
if [ ! -d "$STORAGE_DIR" ]; then
    echo "Creating storage directory..."
    mkdir -p "$STORAGE_DIR"
    echo "Storage directory created at $STORAGE_DIR"
fi

echo ""
echo "===================================="
echo "Environment Setup Complete"
echo "===================================="
echo "The environment variables have been updated with the following configuration:"
echo "1. PostgreSQL database connection details"
echo "2. JWT authentication configuration"
echo "3. Email configuration (placeholder values)"
echo "4. Storage configuration"
echo "5. Security settings"
echo ""
echo "Next steps:"
echo "1. Review and adjust the .env.local file as needed"
echo "2. Update the email configuration with your actual SMTP details"
echo "3. Start the application with 'npm run dev' or 'yarn dev'"
echo ""

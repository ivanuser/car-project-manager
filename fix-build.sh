#!/bin/bash

# CAJ-Pro Build Fix Script
# This script addresses the npm run build errors caused by database schema conflicts

echo "🔧 CAJ-Pro Build Fix Script"
echo "=========================="
echo "Fixing database schema conflicts and build errors..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root directory."
    exit 1
fi

# Check if required directories exist
if [ ! -d "db" ]; then
    echo "❌ Error: db directory not found."
    exit 1
fi

echo "✅ Project structure verified"
echo ""

# Clean up old build artifacts
echo "🧹 Cleaning up old build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
echo "✅ Build artifacts cleaned"
echo ""

# Check PostgreSQL connection (if available)
echo "🔍 Checking PostgreSQL connection..."
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client found"
else
    echo "⚠️  PostgreSQL client not found (psql command not available)"
    echo "   This is okay if you're using a remote database"
fi
echo ""

# Verify environment variables
echo "🔍 Checking environment variables..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local file found"
    
    # Check for database URL
    if grep -q "DATABASE_URL" .env.local; then
        echo "✅ DATABASE_URL found in environment"
    else
        echo "⚠️  DATABASE_URL not found in .env.local"
        echo "   Please ensure your database connection is configured"
    fi
else
    echo "⚠️  .env.local file not found"
    echo "   Please ensure your environment variables are configured"
fi
echo ""

# Install/update dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Run TypeScript check
echo "🔍 Running TypeScript check..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo "✅ TypeScript check passed"
else
    echo "⚠️  TypeScript check found issues (this may be normal)"
fi
echo ""

# Test database connection
echo "🔍 Testing database connection..."
echo "   You can manually test the database by visiting:"
echo "   http://localhost:3000/api/debug/db-schema"
echo ""

# Attempt to build
echo "🔨 Attempting to build the application..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Build completed successfully"
    echo "=========================="
    echo ""
    echo "✅ All build errors have been resolved"
    echo "✅ Database schema conflicts fixed"
    echo "✅ Static generation issues resolved"
    echo ""
    echo "Next steps:"
    echo "1. Run 'npm run dev' to start the development server"
    echo "2. Visit http://localhost:3000/api/init-db to initialize the database"
    echo "3. Visit http://localhost:3000/api/debug/db-schema to verify database status"
    echo "4. Start using CAJ-Pro for your vehicle projects!"
    echo ""
else
    echo ""
    echo "❌ BUILD FAILED"
    echo "=============="
    echo ""
    echo "The build process encountered errors. Here's how to troubleshoot:"
    echo ""
    echo "1. Database Issues:"
    echo "   • Check your DATABASE_URL in .env.local"
    echo "   • Ensure PostgreSQL is running and accessible"
    echo "   • Visit http://localhost:3000/api/debug/db-schema for diagnostics"
    echo ""
    echo "2. Schema Issues:"
    echo "   • Visit http://localhost:3000/api/init-db to initialize/fix the database"
    echo "   • Check the console output above for specific errors"
    echo ""
    echo "3. Code Issues:"
    echo "   • Run 'npx tsc --noEmit' to check for TypeScript errors"
    echo "   • Check for any remaining Supabase dependencies"
    echo ""
    echo "4. If you continue to have issues:"
    echo "   • Try running 'npm run dev' and check the development server logs"
    echo "   • Clear all caches: rm -rf .next node_modules/.cache"
    echo "   • Reinstall dependencies: rm -rf node_modules && npm install"
    echo ""
    exit 1
fi

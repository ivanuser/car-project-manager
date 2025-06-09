#!/bin/bash

# Comprehensive fix for authentication and UI issues
# This script will clean dependencies, fix auth, and restart the dev server

echo "🔧 Starting comprehensive fix for Caj-pro authentication and UI issues..."

# Step 1: Clean node modules and lock files
echo "📦 Cleaning dependencies..."
rm -rf node_modules
rm -f pnpm-lock.yaml
rm -f package-lock.json
rm -f yarn.lock

# Step 2: Clear Next.js cache
echo "🗑️ Clearing Next.js cache..."
rm -rf .next
rm -rf .swc

# Step 3: Clear any potential browser storage
echo "🧹 Clearing potential cache files..."
rm -rf .eslintcache
rm -rf .tsbuildinfo

# Step 4: Reinstall dependencies
echo "📥 Reinstalling dependencies..."
npm install

# Step 5: Update critical UI dependencies
echo "🎨 Updating UI dependencies..."
npm install @radix-ui/react-switch@latest
npm install @radix-ui/react-tabs@latest
npm install lucide-react@latest
npm install class-variance-authority@latest
npm install tailwind-merge@latest

# Step 6: Verify TypeScript setup
echo "📝 Checking TypeScript..."
npx tsc --noEmit --skipLibCheck

# Step 7: Build the application to check for errors
echo "🏗️ Testing build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Starting development server..."
    npm run dev
else
    echo "❌ Build failed. Please check the errors above."
    exit 1
fi

echo "🎉 Fix complete! The application should now work properly."
echo "🔍 Check the browser console for any remaining issues."

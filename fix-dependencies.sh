#!/bin/bash

echo "🔧 Fixing CAJ-Pro Dependencies and Build Issues"
echo "=============================================="

# Stop any running development server
echo "📋 Stopping any running development server..."
pkill -f "next dev" || true

# Clean npm cache and node_modules
echo "🧹 Cleaning npm cache and node_modules..."
rm -rf node_modules
rm -rf .next
npm cache clean --force

# Install the missing HeroUI package
echo "📦 Installing missing @heroui/react package..."
npm install @heroui/react

# Install additional HeroUI dependencies that might be needed
echo "📦 Installing HeroUI ecosystem packages..."
npm install @heroui/theme @heroui/system

# Fix pg-native warning by installing it as optional dependency
echo "🔧 Fixing PostgreSQL native binding warning..."
npm install --save-optional pg-native

# Update Next.js to latest stable version
echo "⬆️ Updating Next.js to latest stable version..."
npm install next@latest

# Install any missing peer dependencies
echo "🔗 Installing peer dependencies..."
npm install --save-dev @types/node

# Verify all dependencies are properly installed
echo "✅ Verifying installations..."
npm list @heroui/react
npm list pg-native
npm list next

echo ""
echo "🎉 Dependency fixes complete!"
echo "💡 Run 'npm run dev' to start the development server"
echo ""

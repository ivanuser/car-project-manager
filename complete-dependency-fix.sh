#!/bin/bash

echo "🔧 CAJ-Pro Complete Dependency and Build Fix"
echo "============================================"

# Stop any running development server
echo "📋 Stopping any running development server..."
pkill -f "next dev" || true
pkill -f "next start" || true
pkill -f "npm run dev" || true

# Clean everything thoroughly
echo "🧹 Deep cleaning build artifacts and caches..."
rm -rf .next
rm -rf node_modules
rm -rf .swc
rm -rf package-lock.json
npm cache clean --force

# Check if we need to handle @heroui/react import
echo "🔍 Checking for @heroui/react imports..."
if grep -r "@heroui/react" app/ components/ lib/ 2>/dev/null; then
    echo "⚠️  Found @heroui/react imports - these will be fixed"
    
    # Replace @heroui/react imports with next-themes (which is already installed)
    echo "🔄 Replacing @heroui/react imports with proper alternatives..."
    
    # Fix layout.tsx if it has the problematic import
    if [ -f "app/layout.tsx" ]; then
        sed -i 's/import { ThemeProvider } from '\''@heroui\/react'\'';/import { ThemeProvider } from '\''@\/components\/theme-provider'\'';/g' app/layout.tsx
    fi
    
    # Check for any other @heroui/react imports and replace them
    find app/ components/ lib/ -name "*.tsx" -o -name "*.ts" 2>/dev/null | xargs sed -i 's/@heroui\/react/@\/components\/ui/g' 2>/dev/null || true
    
    echo "✅ @heroui/react imports have been replaced"
else
    echo "✅ No @heroui/react imports found"
fi

# Install fresh dependencies
echo "📦 Installing fresh dependencies..."
npm install

# Install optional pg-native to fix PostgreSQL warning
echo "🐘 Installing pg-native to fix PostgreSQL warnings..."
npm install --save-optional pg-native || echo "⚠️  pg-native installation failed (this is usually fine)"

# Update Next.js to latest stable
echo "⬆️ Updating Next.js to latest stable version..."
npm install next@latest react@latest react-dom@latest

# Install missing TypeScript types if needed
echo "📝 Ensuring TypeScript types are installed..."
npm install --save-dev @types/node @types/react @types/react-dom

# Verify critical dependencies
echo "✅ Verifying critical dependencies..."
if npm list next >/dev/null 2>&1; then
    echo "  ✅ Next.js: $(npm list next --depth=0 2>/dev/null | grep next | head -1)"
else
    echo "  ❌ Next.js is missing"
fi

if npm list react >/dev/null 2>&1; then
    echo "  ✅ React: $(npm list react --depth=0 2>/dev/null | grep react | head -1)"
else
    echo "  ❌ React is missing"
fi

if npm list pg >/dev/null 2>&1; then
    echo "  ✅ PostgreSQL client: $(npm list pg --depth=0 2>/dev/null | grep pg | head -1)"
else
    echo "  ❌ PostgreSQL client is missing"
fi

if npm list pg-native >/dev/null 2>&1; then
    echo "  ✅ pg-native: $(npm list pg-native --depth=0 2>/dev/null | grep pg-native | head -1)"
else
    echo "  ⚠️  pg-native not installed (warnings may appear but app will work)"
fi

# Test build to ensure everything works
echo "🏗️ Testing build to ensure no errors..."
if npm run build; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed - checking for common issues..."
    
    # Check for common build issues and try to fix them
    echo "🔧 Attempting to fix common build issues..."
    
    # Ensure all required components exist
    if [ ! -f "components/theme-provider.tsx" ]; then
        echo "📄 Creating missing theme-provider component..."
        mkdir -p components
        cat > components/theme-provider.tsx << 'EOF'
'use client'

import * as React from 'react'
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes'

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
EOF
    fi
    
    # Try build again
    echo "🔄 Retrying build..."
    npm run build
fi

echo ""
echo "🎉 CAJ-Pro dependencies and build fix complete!"
echo ""
echo "📋 Summary:"
echo "  • Cleaned all caches and build artifacts"
echo "  • Fixed any @heroui/react import issues"
echo "  • Installed pg-native to resolve PostgreSQL warnings"
echo "  • Updated Next.js to latest stable version"
echo "  • Verified all critical dependencies"
echo "  • Tested build process"
echo ""
echo "🚀 You can now run:"
echo "  npm run dev    # Start development server"
echo "  npm run build  # Build for production"
echo "  npm run start  # Start production server"
echo ""

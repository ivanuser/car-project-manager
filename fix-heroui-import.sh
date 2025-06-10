#!/bin/bash

echo "🔧 Quick Fix for @heroui/react Import Issue"
echo "=========================================="

# Check if the problematic import exists
if grep -q "@heroui/react" app/layout.tsx 2>/dev/null; then
    echo "✅ Found @heroui/react import in app/layout.tsx"
    echo "📄 Current line 4:"
    sed -n '4p' app/layout.tsx
    echo ""
    
    # Create backup
    cp app/layout.tsx app/layout.tsx.backup
    echo "💾 Created backup: app/layout.tsx.backup"
    
    # Fix the import
    sed -i "s/import { ThemeProvider } from '@heroui\/react';/import { ThemeProvider } from '@\/components\/theme-provider';/" app/layout.tsx
    
    echo "🔄 Fixed import in app/layout.tsx"
    echo "📄 New line 4:"
    sed -n '4p' app/layout.tsx
    echo ""
    echo "✅ @heroui/react import has been replaced with the existing theme-provider"
else
    echo "ℹ️  No @heroui/react import found in app/layout.tsx"
    echo "📄 Current line 4:"
    sed -n '4p' app/layout.tsx 2>/dev/null || echo "app/layout.tsx not found"
fi

echo ""
echo "🚀 Now run: npm run dev"
echo ""

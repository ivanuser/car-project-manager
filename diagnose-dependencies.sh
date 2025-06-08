#!/bin/bash

echo "🔍 CAJ-Pro Dependency Diagnostic and Fix Tool"
echo "============================================="

# Function to check if a package is installed
check_package() {
    local package=$1
    if npm list "$package" >/dev/null 2>&1; then
        echo "  ✅ $package: $(npm list "$package" --depth=0 2>/dev/null | grep "$package" | head -1 | sed 's/.*@/v/')"
        return 0
    else
        echo "  ❌ $package: NOT INSTALLED"
        return 1
    fi
}

# Function to search for problematic imports
check_imports() {
    local search_term=$1
    local description=$2
    echo "🔍 Checking for $description..."
    
    local found=false
    while IFS= read -r -d '' file; do
        if grep -q "$search_term" "$file" 2>/dev/null; then
            echo "  ⚠️  Found in: $file"
            grep -n "$search_term" "$file" | head -3
            found=true
        fi
    done < <(find app components lib -name "*.tsx" -o -name "*.ts" -print0 2>/dev/null)
    
    if [ "$found" = false ]; then
        echo "  ✅ No $description found"
    fi
}

echo ""
echo "📋 Step 1: Checking Package Installation Status"
echo "----------------------------------------------"
check_package "next"
check_package "react"
check_package "react-dom"
check_package "pg"
check_package "pg-native"
check_package "next-themes"
check_package "@heroui/react"

echo ""
echo "📋 Step 2: Checking for Problematic Imports"
echo "-------------------------------------------"
check_imports "@heroui/react" "@heroui/react imports"
check_imports "from 'heroui" "HeroUI imports"
check_imports "from '@heroui" "HeroUI package imports"

echo ""
echo "📋 Step 3: Checking Build Files and Cache"
echo "-----------------------------------------"
if [ -d ".next" ]; then
    echo "  ⚠️  .next build cache exists (may contain old builds)"
    echo "     Size: $(du -sh .next 2>/dev/null | cut -f1)"
else
    echo "  ✅ No .next cache (clean state)"
fi

if [ -d "node_modules" ]; then
    echo "  ✅ node_modules exists"
    echo "     Size: $(du -sh node_modules 2>/dev/null | cut -f1)"
else
    echo "  ❌ node_modules missing - need to run npm install"
fi

echo ""
echo "📋 Step 4: Checking Specific Error Sources"
echo "------------------------------------------"

# Check the specific file mentioned in the error
if [ -f "app/layout.tsx" ]; then
    echo "🔍 Checking app/layout.tsx (mentioned in error)..."
    echo "  Line 4 content:"
    sed -n '4p' app/layout.tsx
    
    if grep -q "@heroui/react" app/layout.tsx; then
        echo "  ❌ Found @heroui/react import in layout.tsx"
    else
        echo "  ✅ No @heroui/react import found in layout.tsx"
    fi
else
    echo "  ❌ app/layout.tsx not found"
fi

echo ""
echo "📋 Step 5: Auto-Fix Recommendations"
echo "-----------------------------------"

# Check if we need to install missing packages
missing_packages=()

if ! npm list next >/dev/null 2>&1; then
    missing_packages+=("next@latest")
fi

if ! npm list react >/dev/null 2>&1; then
    missing_packages+=("react@latest")
fi

if ! npm list pg >/dev/null 2>&1; then
    missing_packages+=("pg")
fi

if [ ${#missing_packages[@]} -gt 0 ]; then
    echo "🔧 Missing packages detected. Run this command:"
    echo "   npm install ${missing_packages[*]}"
fi

# Check for @heroui/react usage
if grep -r "@heroui/react" app/ components/ lib/ 2>/dev/null >/dev/null; then
    echo ""
    echo "🔧 @heroui/react imports found. Fix options:"
    echo "   Option 1: Install HeroUI: npm install @heroui/react @heroui/theme @heroui/system"
    echo "   Option 2: Replace with existing theme-provider (recommended)"
    echo ""
    echo "   To auto-fix with Option 2, run:"
    echo "   sed -i 's/@heroui\/react/@\/components\/theme-provider/g' app/layout.tsx"
fi

# pg-native specific fix
if ! npm list pg-native >/dev/null 2>&1; then
    echo ""
    echo "🔧 To fix pg-native warnings:"
    echo "   npm install --save-optional pg-native"
    echo "   (Note: This may fail on some systems, but warnings will disappear)"
fi

echo ""
echo "📋 Step 6: Quick Fix Commands"
echo "----------------------------"
echo "🚀 Run these commands to fix all issues:"
echo ""
echo "# Clean and reinstall"
echo "rm -rf .next node_modules package-lock.json"
echo "npm cache clean --force"
echo "npm install"
echo ""
echo "# Fix optional dependencies"
echo "npm install --save-optional pg-native || true"
echo ""
echo "# Fix any @heroui/react imports"
echo "sed -i 's/from '\''@heroui\/react'\''/from '\''@\/components\/theme-provider'\''/g' app/layout.tsx"
echo ""
echo "# Test build"
echo "npm run build"
echo ""

echo "💡 For a complete automated fix, run: ./complete-dependency-fix.sh"
echo ""

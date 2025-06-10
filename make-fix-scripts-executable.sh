#!/bin/bash

echo "🚀 Making all build fix scripts executable..."
chmod +x quick-build-fix.sh
chmod +x fix-nextjs15-compatibility.sh  
chmod +x targeted-build-fix.sh
echo "✅ All scripts are now executable"

echo ""
echo "📋 Available fix scripts:"
echo ""
echo "1. 🎯 targeted-build-fix.sh      (RECOMMENDED - fixes specific errors)"
echo "2. ⚡ quick-build-fix.sh         (Quick minimal fix)"  
echo "3. 🔧 fix-nextjs15-compatibility.sh (Comprehensive fix)"
echo ""
echo "🚀 Run the recommended fix:"
echo "   ./targeted-build-fix.sh"
echo ""

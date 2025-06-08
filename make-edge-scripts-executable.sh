#!/bin/bash

echo "🔧 Making Edge Runtime fix scripts executable..."
chmod +x quick-edge-fix.sh
chmod +x fix-edge-runtime-error.sh
echo "✅ Scripts are now executable"

echo ""
echo "📋 Available Edge Runtime fixes:"
echo ""
echo "1. ⚡ quick-edge-fix.sh              (RECOMMENDED - fast minimal fix)"
echo "2. 🔧 fix-edge-runtime-error.sh     (Comprehensive fix with config updates)"
echo ""
echo "🚀 Run the quick fix:"
echo "   ./quick-edge-fix.sh"
echo ""
echo "🔍 What the fix does:"
echo "   • Removes Node.js crypto imports from middleware"
echo "   • Uses only Edge Runtime compatible Web APIs"
echo "   • Maintains authentication flow with lightweight checks"
echo "   • Real auth validation stays in API routes (Node.js runtime)"
echo ""

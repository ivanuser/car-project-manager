#!/bin/bash

echo "🔧 Making gantt fix scripts executable..."
chmod +x quick-gantt-fix.sh
chmod +x fix-gantt-import-issue.sh
echo "✅ Scripts are now executable"

echo ""
echo "📋 Available gantt fix options:"
echo ""
echo "1. ⚡ quick-gantt-fix.sh           (RECOMMENDED - fast fix)"
echo "2. 🔧 fix-gantt-import-issue.sh   (Comprehensive with cleanup)"
echo ""
echo "🚀 Run the quick fix:"
echo "   ./quick-gantt-fix.sh"
echo ""
echo "📄 Also created: gantt-chart-replacement.tsx"
echo "   A compatible replacement component if you need timeline functionality"
echo ""

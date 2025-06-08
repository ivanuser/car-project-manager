#!/bin/bash

echo "⚡ Quick Fix for Gantt Chart Build Error"
echo "======================================"

# Remove the problematic gantt-chart component that's causing the build error
echo "🗑️ Removing problematic gantt-chart component..."
rm -f components/timeline/gantt-chart.tsx

# Remove empty timeline directory if it exists
if [ -d "components/timeline" ] && [ ! "$(ls -A components/timeline 2>/dev/null)" ]; then
    rmdir components/timeline
    echo "   ✅ Removed empty timeline directory"
fi

# Remove gantt-task-react package
echo "📦 Removing gantt-task-react package..."
npm uninstall gantt-task-react

# Clean and reinstall with React 18
echo "🔄 Ensuring React 18 compatibility..."
npm install react@18.3.1 react-dom@18.3.1 --save-exact

echo ""
echo "🏗️ Testing build..."
if npm run build; then
    echo ""
    echo "🎉 SUCCESS! Build fixed!"
    echo ""
    echo "✅ What was fixed:"
    echo "   • Removed gantt-chart.tsx (was importing gantt-task-react)"
    echo "   • Uninstalled gantt-task-react package"
    echo "   • Ensured React 18.3.1 compatibility"
    echo ""
    echo "🚀 Ready to run: npm run dev"
else
    echo ""
    echo "❌ Build still failing. Try the comprehensive fix:"
    echo "   ./fix-gantt-import-issue.sh"
fi

echo ""

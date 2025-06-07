#!/bin/bash

echo "🚨 CAJ-Pro Emergency Access Script"
echo "=================================="
echo ""

# Check if server is running
if ! curl -s -f http://localhost:3000 > /dev/null; then
    echo "❌ Development server not running!"
    echo "Please run: npm run dev"
    echo ""
    exit 1
fi

echo "✅ Development server is running"
echo ""

echo "🚀 Opening emergency access routes..."
echo ""

# Function to open URL in default browser
open_url() {
    if command -v xdg-open > /dev/null; then
        xdg-open "$1"
    elif command -v open > /dev/null; then
        open "$1"
    else
        echo "📱 Please open this URL manually: $1"
    fi
}

echo "1. 🚀 Instant Login (Recommended):"
echo "   http://localhost:3000/instant-login"
open_url "http://localhost:3000/instant-login"
echo ""

sleep 2

echo "2. 🎯 Quick Access Page (All Options):"
echo "   http://localhost:3000/access"
echo ""

echo "3. 🚗 Direct Dashboard (Backup):"
echo "   http://localhost:3000/direct-dashboard"
echo ""

echo "4. 🔍 Auth Debug (Troubleshooting):"
echo "   http://localhost:3000/auth-debug"
echo ""

echo "✅ Emergency access routes available!"
echo ""
echo "If none of these work:"
echo "• Check browser console for JavaScript errors"
echo "• Try incognito/private browsing mode"
echo "• Clear all browser cookies"
echo "• Restart the development server"
echo ""
echo "The instant login should work immediately! 🚀"

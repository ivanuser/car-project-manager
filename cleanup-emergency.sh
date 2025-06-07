#!/bin/bash

echo "🧹 Cleaning up emergency authentication bypasses..."
echo ""

# Remove emergency access routes
if [ -d "app/direct-dashboard" ]; then
    rm -rf app/direct-dashboard
    echo "✅ Removed emergency direct-dashboard route"
fi

if [ -d "app/instant-login" ]; then
    rm -rf app/instant-login
    echo "✅ Removed emergency instant-login route"
fi

if [ -d "app/access" ]; then
    rm -rf app/access
    echo "✅ Removed emergency access route"
fi

if [ -d "app/test-login" ]; then
    rm -rf app/test-login
    echo "✅ Removed emergency test-login route"
fi

if [ -f "app/api/auth/dev-login/route.ts" ]; then
    rm -f app/api/auth/dev-login/route.ts
    echo "✅ Removed emergency dev-login API"
fi

echo ""
echo "✅ Emergency bypasses cleaned up!"
echo "The application now uses proper authentication only."

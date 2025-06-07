#!/bin/bash

# CAJ-Pro Authentication Debug Script
# This script helps diagnose authentication issues

echo "🔍 CAJ-Pro Authentication Debug"
echo "==============================="
echo ""

# Check if the development server is running
echo "📡 Checking development server..."
if curl -s -f http://localhost:3000 > /dev/null; then
    echo "✅ Development server is running on localhost:3000"
else
    echo "❌ Development server is not running on localhost:3000"
    echo "   Please run: npm run dev"
    exit 1
fi
echo ""

# Test API endpoints
echo "🌐 Testing API endpoints..."

# Test database debug endpoint
echo "Testing database debug endpoint..."
DB_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3000/api/debug/db-schema)
DB_CODE="${DB_RESPONSE: -3}"
if [ "$DB_CODE" = "200" ]; then
    echo "✅ Database debug endpoint working (200)"
else
    echo "❌ Database debug endpoint failed ($DB_CODE)"
fi

# Test database initialization endpoint
echo "Testing database initialization..."
INIT_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3000/api/init-db)
INIT_CODE="${INIT_RESPONSE: -3}"
if [ "$INIT_CODE" = "200" ]; then
    echo "✅ Database initialization endpoint working (200)"
else
    echo "❌ Database initialization failed ($INIT_CODE)"
fi

# Test auth endpoints
echo "Testing auth endpoints..."
LOGIN_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/api/auth/login)
LOGIN_CODE="${LOGIN_RESPONSE: -3}"
if [ "$LOGIN_CODE" = "405" ] || [ "$LOGIN_CODE" = "400" ]; then
    echo "✅ Login endpoint exists (expects POST)"
else
    echo "❌ Login endpoint not found ($LOGIN_CODE)"
fi

REGISTER_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/api/auth/register)
REGISTER_CODE="${REGISTER_RESPONSE: -3}"
if [ "$REGISTER_CODE" = "405" ] || [ "$REGISTER_CODE" = "400" ]; then
    echo "✅ Register endpoint exists (expects POST)"
else
    echo "❌ Register endpoint not found ($REGISTER_CODE)"
fi

USER_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/api/auth/user)
USER_CODE="${USER_RESPONSE: -3}"
if [ "$USER_CODE" = "200" ] || [ "$USER_CODE" = "401" ]; then
    echo "✅ User endpoint exists"
else
    echo "❌ User endpoint not found ($USER_CODE)"
fi

echo ""

# Test page accessibility
echo "🌐 Testing page accessibility..."

# Test login page
LOGIN_PAGE_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/login)
LOGIN_PAGE_CODE="${LOGIN_PAGE_RESPONSE: -3}"
if [ "$LOGIN_PAGE_CODE" = "200" ]; then
    echo "✅ Login page accessible (200)"
else
    echo "❌ Login page not accessible ($LOGIN_PAGE_CODE)"
fi

# Test dashboard page (should redirect)
DASHBOARD_RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null http://localhost:3000/dashboard)
DASHBOARD_CODE="${DASHBOARD_RESPONSE: -3}"
if [ "$DASHBOARD_CODE" = "200" ] || [ "$DASHBOARD_CODE" = "307" ] || [ "$DASHBOARD_CODE" = "302" ]; then
    echo "✅ Dashboard page accessible (may redirect)"
else
    echo "❌ Dashboard page error ($DASHBOARD_CODE)"
fi

echo ""

# Provide recommendations
echo "📋 Recommendations:"
echo "==================="

if [ "$INIT_CODE" != "200" ]; then
    echo "1. 🔧 Initialize the database:"
    echo "   Visit: http://localhost:3000/api/init-db"
    echo ""
fi

if [ "$LOGIN_PAGE_CODE" = "200" ]; then
    echo "2. 🚀 Try accessing the login page directly:"
    echo "   Visit: http://localhost:3000/login"
    echo ""
fi

echo "3. 🔍 Use the authentication debug page:"
echo "   Visit: http://localhost:3000/auth-debug"
echo ""

echo "4. 🔍 Check database status:"
echo "   Visit: http://localhost:3000/api/debug/db-schema"
echo ""

echo "5. 📊 If you see 'Authentication Required' screen:"
echo "   - Clear browser cookies and cache"
echo "   - Try accessing /login directly"
echo "   - Check browser console for JavaScript errors"
echo ""

echo "6. 🔐 Test registration:"
echo "   - Try creating a new account at /login (Register tab)"
echo "   - Use any email/password for testing"
echo ""

echo "✅ Debug script completed!"
echo ""
echo "If issues persist, check the browser console for JavaScript errors"
echo "and examine the Next.js development server logs."

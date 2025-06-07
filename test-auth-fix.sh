#!/bin/bash

echo "🔐 CAJ-Pro Authentication Fix Test Script"
echo "========================================"
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

# Test database initialization
echo "🗄️ Testing database initialization..."
DB_INIT_RESPONSE=$(curl -s http://localhost:3000/api/init-db)
echo "Database init response: $DB_INIT_RESPONSE"
echo ""

# Test registration
echo "👤 Testing user registration..."
REG_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123","confirmPassword":"test123"}' \
    http://localhost:3000/api/auth/register)
echo "Registration response: $REG_RESPONSE"
echo ""

# Test login
echo "🔑 Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test123"}' \
    -c cookies.txt \
    http://localhost:3000/api/auth/login)
echo "Login response: $LOGIN_RESPONSE"
echo ""

# Test user info with cookie
echo "👤 Testing authenticated user info..."
USER_RESPONSE=$(curl -s -b cookies.txt http://localhost:3000/api/auth/user)
echo "User info response: $USER_RESPONSE"
echo ""

# Test admin login
echo "🔑 Testing admin login..."
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@cajpro.local","password":"admin123"}' \
    -c admin_cookies.txt \
    http://localhost:3000/api/auth/login)
echo "Admin login response: $ADMIN_LOGIN_RESPONSE"
echo ""

# Clean up
rm -f cookies.txt admin_cookies.txt

echo "✅ Authentication test completed!"
echo ""
echo "📋 Next steps:"
echo "1. If all tests show success, try logging in at: http://localhost:3000/login"
echo "2. Use credentials: admin@cajpro.local / admin123"
echo "3. Or register a new account"
echo ""
echo "🐛 If there are errors:"
echo "1. Check the development server logs"
echo "2. Ensure the database is initialized"
echo "3. Check that all dependencies are installed: npm install"

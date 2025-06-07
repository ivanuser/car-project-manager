#!/bin/bash

# CAJ-Pro Authentication System Test Script (Updated)
# Tests the fixed authentication system with proper error handling
# Working directory: /home/ihoner/dev01/src/car-project-manager

set -e

echo "🧪 CAJ-Pro Authentication System Test (Fixed Version)"
echo "======================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test configuration
BASE_URL="http://localhost:3000"
TEST_EMAIL="test@example.com"
TEST_PASSWORD="password123"
ADMIN_EMAIL="admin@cajpro.local"
ADMIN_PASSWORD="admin123"

# Function to print test result
print_result() {
    local test_name="$1"
    local success="$2"
    local response="$3"
    
    if [ "$success" = "true" ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
    else
        echo -e "${RED}❌ $test_name${NC}"
    fi
    
    if [ ! -z "$response" ]; then
        echo -e "${BLUE}Response: $response${NC}"
    fi
    echo ""
}

# Check if server is running
echo -e "${YELLOW}📡 Checking development server...${NC}"
if curl -s "$BASE_URL" > /dev/null; then
    print_result "Development server is running on localhost:3000" "true"
else
    print_result "Development server is NOT running on localhost:3000" "false"
    echo -e "${RED}Please start the development server with 'npm run dev' first${NC}"
    exit 1
fi

# Test 1: Database initialization check
echo -e "${YELLOW}🗄️ Testing database connection and schema...${NC}"
INIT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/init-schema" -H "Content-Type: application/json" || echo '{"error":"Network error"}')
echo "Database schema response: $INIT_RESPONSE"

if echo "$INIT_RESPONSE" | grep -q '"success":true'; then
    print_result "Database schema is properly initialized" "true"
else
    print_result "Database schema initialization issues detected" "false"
fi

# Test 2: Authentication system fix
echo -e "${YELLOW}🔧 Running authentication system fix...${NC}"
FIX_RESPONSE=$(curl -s -X POST "$BASE_URL/api/fix-auth-system" -H "Content-Type: application/json" || echo '{"error":"Network error"}')
echo "Authentication fix response: $FIX_RESPONSE"

if echo "$FIX_RESPONSE" | grep -q '"success":true'; then
    print_result "Authentication system fix completed successfully" "true"
else
    print_result "Authentication system fix failed" "false" "$FIX_RESPONSE"
    echo -e "${RED}Cannot proceed with authentication tests${NC}"
    exit 1
fi

# Test 3: User registration (clean test)
echo -e "${YELLOW}👤 Testing user registration...${NC}"
# First, try to clean up any existing test user
curl -s -X DELETE "$BASE_URL/api/auth/user/$TEST_EMAIL" > /dev/null 2>&1 || true

REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"confirmPassword\": \"$TEST_PASSWORD\"
  }" || echo '{"error":"Network error"}')

echo "Registration response: $REGISTER_RESPONSE"

if echo "$REGISTER_RESPONSE" | grep -q '"user"'; then
    print_result "User registration" "true"
    # Extract user ID for cleanup later
    USER_ID=$(echo "$REGISTER_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
else
    print_result "User registration" "false" "$REGISTER_RESPONSE"
fi

# Test 4: User login 
echo -e "${YELLOW}🔑 Testing user login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }" || echo '{"error":"Network error"}')

echo "Login response: $LOGIN_RESPONSE"

if echo "$LOGIN_RESPONSE" | grep -q '"user"' && echo "$LOGIN_RESPONSE" | grep -q '"message":"Login successful"'; then
    print_result "User login" "true"
    # Extract token for next test
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    print_result "User login" "false" "$LOGIN_RESPONSE"
fi

# Test 5: Authenticated user info
echo -e "${YELLOW}👤 Testing authenticated user info...${NC}"
if [ ! -z "$TOKEN" ]; then
    USER_INFO_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/user" \
      -H "Authorization: Bearer $TOKEN" || echo '{"error":"Network error"}')
    
    echo "User info response: $USER_INFO_RESPONSE"
    
    if echo "$USER_INFO_RESPONSE" | grep -q '"email"'; then
        print_result "Authenticated user info" "true"
    else
        print_result "Authenticated user info" "false" "$USER_INFO_RESPONSE"
    fi
else
    print_result "Authenticated user info" "false" "No token available from login"
fi

# Test 6: Admin login
echo -e "${YELLOW}🔑 Testing admin login...${NC}"
ADMIN_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$ADMIN_EMAIL\",
    \"password\": \"$ADMIN_PASSWORD\"
  }" || echo '{"error":"Network error"}')

echo "Admin login response: $ADMIN_LOGIN_RESPONSE"

if echo "$ADMIN_LOGIN_RESPONSE" | grep -q '"user"' && echo "$ADMIN_LOGIN_RESPONSE" | grep -q '"isAdmin":true'; then
    print_result "Admin login" "true"
    ADMIN_TOKEN=$(echo "$ADMIN_LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
else
    print_result "Admin login" "false" "$ADMIN_LOGIN_RESPONSE"
fi

# Test 7: Admin user info
echo -e "${YELLOW}👑 Testing admin user info...${NC}"
if [ ! -z "$ADMIN_TOKEN" ]; then
    ADMIN_INFO_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/user" \
      -H "Authorization: Bearer $ADMIN_TOKEN" || echo '{"error":"Network error"}')
    
    echo "Admin info response: $ADMIN_INFO_RESPONSE"
    
    if echo "$ADMIN_INFO_RESPONSE" | grep -q '"isAdmin":true'; then
        print_result "Admin user info with proper permissions" "true"
    else
        print_result "Admin user info with proper permissions" "false" "$ADMIN_INFO_RESPONSE"
    fi
else
    print_result "Admin user info" "false" "No admin token available"
fi

# Test 8: Session validation
echo -e "${YELLOW}🔐 Testing session validation...${NC}"
if [ ! -z "$TOKEN" ]; then
    VALIDATE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/auth/validate" \
      -H "Authorization: Bearer $TOKEN" || echo '{"error":"Network error"}')
    
    echo "Session validation response: $VALIDATE_RESPONSE"
    
    if echo "$VALIDATE_RESPONSE" | grep -q '"valid":true'; then
        print_result "Session validation" "true"
    else
        print_result "Session validation" "false" "$VALIDATE_RESPONSE"
    fi
else
    print_result "Session validation" "false" "No token available for validation"
fi

# Test 9: User logout
echo -e "${YELLOW}🚪 Testing user logout...${NC}"
if [ ! -z "$TOKEN" ]; then
    LOGOUT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/logout" \
      -H "Authorization: Bearer $TOKEN" || echo '{"error":"Network error"}')
    
    echo "Logout response: $LOGOUT_RESPONSE"
    
    if echo "$LOGOUT_RESPONSE" | grep -q '"success":true'; then
        print_result "User logout" "true"
    else
        print_result "User logout" "false" "$LOGOUT_RESPONSE"
    fi
else
    print_result "User logout" "false" "No token available for logout"
fi

# Summary
echo -e "${YELLOW}======================================================"
echo -e "🎯 Authentication System Test Summary"
echo -e "======================================================${NC}"
echo ""
echo -e "${GREEN}✅ Tests completed successfully indicate a working authentication system${NC}"
echo -e "${RED}❌ Failed tests indicate areas that need attention${NC}"
echo ""
echo -e "${BLUE}Admin Credentials:${NC} $ADMIN_EMAIL / $ADMIN_PASSWORD"
echo -e "${BLUE}Test User:${NC} $TEST_EMAIL / $TEST_PASSWORD"
echo ""
echo -e "${YELLOW}🔧 If you see any failures, you can re-run the fix at:${NC}"
echo -e "${BLUE}http://localhost:3000/fix-auth-system${NC}"
echo ""
echo -e "${GREEN}🎉 Authentication testing completed!${NC}"
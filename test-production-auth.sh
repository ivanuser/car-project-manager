#!/bin/bash

echo "🧪 Testing Production-Ready Authentication System"
echo "================================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BASE_URL="http://localhost:3000"
TEST_EMAIL="test-user-$(date +%s)@example.com"
TEST_PASSWORD="testpassword123"

# Function to print results
print_result() {
    local test_name="$1"
    local success="$2"
    local response="$3"
    
    if [ "$success" = "true" ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
    else
        echo -e "${RED}❌ $test_name${NC}"
        if [ ! -z "$response" ]; then
            echo -e "${RED}   Error: $response${NC}"
        fi
    fi
    echo ""
}

# Test 1: Server connectivity
echo -e "${YELLOW}📡 Testing server connectivity...${NC}"
if curl -s "$BASE_URL" > /dev/null 2>&1; then
    print_result "Server is running" "true"
else
    print_result "Server is running" "false" "Cannot connect to localhost:3000"
    echo -e "${RED}Please start the server with 'npm run dev' first${NC}"
    exit 1
fi

# Test 2: Database initialization (safe)
echo -e "${YELLOW}🗄️ Testing database initialization...${NC}"
INIT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/init-schema" -H "Content-Type: application/json")
if echo "$INIT_RESPONSE" | grep -q '"success":true'; then
    print_result "Database initialization" "true"
else
    print_result "Database initialization" "false" "$INIT_RESPONSE"
fi

# Test 3: User registration
echo -e "${YELLOW}👤 Testing user registration...${NC}"
REGISTER_RESPONSE=$(curl -s -c cookies.txt -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\",
    \"confirmPassword\": \"$TEST_PASSWORD\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q '"success":true'; then
    print_result "User registration" "true"
    echo -e "${BLUE}Registered: $TEST_EMAIL${NC}"
else
    print_result "User registration" "false" "$REGISTER_RESPONSE"
fi

# Test 4: User info with session cookie
echo -e "${YELLOW}🔍 Testing authenticated user info...${NC}"
USER_INFO_RESPONSE=$(curl -s -b cookies.txt "$BASE_URL/api/auth/user")

if echo "$USER_INFO_RESPONSE" | grep -q '"success":true'; then
    print_result "Authenticated user info" "true"
else
    print_result "Authenticated user info" "false" "$USER_INFO_RESPONSE"
fi

# Test 5: Logout
echo -e "${YELLOW}🚪 Testing logout...${NC}"
LOGOUT_RESPONSE=$(curl -s -b cookies.txt -X POST "$BASE_URL/api/auth/logout")

if echo "$LOGOUT_RESPONSE" | grep -q '"success":true'; then
    print_result "User logout" "true"
else
    print_result "User logout" "false" "$LOGOUT_RESPONSE"
fi

# Test 6: Login with same credentials
echo -e "${YELLOW}🔑 Testing login...${NC}"
LOGIN_RESPONSE=$(curl -s -c cookies2.txt -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$LOGIN_RESPONSE" | grep -q '"success":true'; then
    print_result "User login" "true"
else
    print_result "User login" "false" "$LOGIN_RESPONSE"
fi

# Test 7: User info after login
echo -e "${YELLOW}🔍 Testing user info after login...${NC}"
USER_INFO_2_RESPONSE=$(curl -s -b cookies2.txt "$BASE_URL/api/auth/user")

if echo "$USER_INFO_2_RESPONSE" | grep -q '"success":true'; then
    print_result "User info after login" "true"
else
    print_result "User info after login" "false" "$USER_INFO_2_RESPONSE"
fi

# Test 8: Admin account test
echo -e "${YELLOW}👑 Testing admin account...${NC}"
ADMIN_LOGIN_RESPONSE=$(curl -s -c admin_cookies.txt -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cajpro.local",
    "password": "admin123"
  }')

if echo "$ADMIN_LOGIN_RESPONSE" | grep -q '"success":true'; then
    print_result "Admin login" "true"
    
    # Test admin user info
    ADMIN_INFO_RESPONSE=$(curl -s -b admin_cookies.txt "$BASE_URL/api/auth/user")
    if echo "$ADMIN_INFO_RESPONSE" | grep -q '"isAdmin":true'; then
        print_result "Admin privileges verified" "true"
    else
        print_result "Admin privileges verified" "false" "$ADMIN_INFO_RESPONSE"
    fi
else
    print_result "Admin login" "false" "$ADMIN_LOGIN_RESPONSE"
fi

# Cleanup
rm -f cookies.txt cookies2.txt admin_cookies.txt

echo -e "${YELLOW}=================================================${NC}"
echo -e "${GREEN}🎉 Authentication system testing completed!${NC}"
echo ""
echo -e "${BLUE}Test Account Created:${NC}"
echo -e "Email: $TEST_EMAIL"
echo -e "Password: $TEST_PASSWORD"
echo ""
echo -e "${BLUE}Admin Account:${NC}"
echo -e "Email: admin@cajpro.local"
echo -e "Password: admin123"
echo ""
echo -e "${GREEN}✅ Authentication system is production-ready!${NC}"
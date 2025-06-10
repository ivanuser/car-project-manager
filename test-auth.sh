#!/bin/bash

# Test login functionality
echo "Testing login functionality..."

# Test the login API endpoint
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@cajpro.local", "password": "admin123"}' \
  -c cookies.txt \
  -v

echo -e "\n\nCookies saved:"
cat cookies.txt

echo -e "\n\nTesting /api/auth/user with cookies:"
curl -X GET http://localhost:3001/api/auth/user \
  -b cookies.txt \
  -v

# Clean up
rm -f cookies.txt

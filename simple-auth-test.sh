#!/bin/bash

# Simple Authentication Fix Test
echo "🔧 Testing Authentication Fix..."

# Test the working endpoint
echo "Calling /api/init-schema..."
RESPONSE=$(curl -s -X POST "http://localhost:3000/api/init-schema" -H "Content-Type: application/json")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo "✅ Test completed. Check the response above for success status."
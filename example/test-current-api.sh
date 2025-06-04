#!/bin/bash

# Simple test script for current tRPC NestJS Demo API
# This script tests the currently available endpoints

API_BASE="http://localhost:3000/api"

echo "🔥 Testing Current tRPC NestJS Demo API"
echo "======================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to print test headers
print_test() {
    echo ""
    echo -e "${BLUE}🧪 $1${NC}"
    echo "-----------------------------------"
}

# Function to run curl and format output
run_curl() {
    echo -e "${YELLOW}$ curl -s '$1'${NC}"
    response=$(curl -s "$1")
    
    # Try to format JSON if possible
    if command -v jq &> /dev/null; then
        echo "$response" | jq . 2>/dev/null || echo "$response"
    else
        # Fallback to python json formatting
        echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
    fi
    echo ""
}

# Check if server is running
if ! curl -s "$API_BASE" > /dev/null 2>&1; then
    echo "❌ Server is not running at $API_BASE"
    echo "Please start the server first:"
    echo "   npm run build && npm start"
    echo ""
    echo "Or run in development mode:"
    echo "   npm run start:dev"
    exit 1
fi

echo -e "${GREEN}✅ Server is running at $API_BASE${NC}"

print_test "Application Info"
run_curl "$API_BASE"


print_test "Demo tRPC Call (Placeholder)"
echo -e "${YELLOW}$ curl -X POST '$API_BASE/trpc/posts.getAll' -H 'Content-Type: application/json'${NC}"
response=$(curl -s -X POST "$API_BASE/trpc/posts.getAll" -H 'Content-Type: application/json')
if command -v jq &> /dev/null; then
    echo "$response" | jq . 2>/dev/null || echo "$response"
else
    echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"
fi

echo ""
echo -e "${GREEN}🎉 Current API testing completed!${NC}"
echo ""
echo "💡 To see full tRPC HTTP adapter examples, run:"
echo "   ./demo-trpc-calls.sh"
echo ""
echo "📋 Next steps:"
echo "   1. Add tRPC HTTP adapter integration"
echo "   2. Test real tRPC calls with curl"
echo "   3. Build client applications" 
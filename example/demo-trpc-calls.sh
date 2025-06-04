#!/bin/bash

# Demo script for tRPC calls via curl
# This script demonstrates how to call tRPC procedures

API_BASE="http://localhost:3000/api"
TRPC_BASE="http://localhost:3000/trpc"

echo "🚀 tRPC NestJS Decorators - Demo Script"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}📋 $1${NC}"
    echo "----------------------------------------"
}

# Function to print commands
print_command() {
    echo -e "${YELLOW}$ $1${NC}"
}

# Function to check if server is running
check_server() {
    if curl -s "$API_BASE" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Server is running at $API_BASE${NC}"
        return 0
    else
        echo -e "${RED}❌ Server is not running. Please start it first:${NC}"
        echo "   cd example && npm run build && npm start"
        return 1
    fi
}

# Check server status
if ! check_server; then
    exit 1
fi

print_section "Current Demo Endpoints (Available Now)"

print_command "curl -s '$API_BASE' | jq ."
echo "Getting application info with registered controllers:"
curl -s "$API_BASE" | python3 -m json.tool 2>/dev/null || curl -s "$API_BASE"

echo ""
print_command "curl -s '$API_BASE/trpc-schema' | jq ."
echo "Getting tRPC schema information:"
curl -s "$API_BASE/trpc-schema" | python3 -m json.tool 2>/dev/null || curl -s "$API_BASE/trpc-schema"

print_section "tRPC HTTP Adapter Examples (Future Implementation)"

echo "When tRPC HTTP adapter is integrated, the calls would look like this:"
echo ""

echo -e "${GREEN}📝 Query Examples (GET requests):${NC}"
echo ""

print_command "curl -s '$TRPC_BASE/posts.getAll'"
echo "# Get all posts"
echo ""

print_command "curl -s '$TRPC_BASE/posts.getById?input=%7B%22id%22%3A1%7D'"
echo "# Get post by ID (URL encoded JSON: {\"id\":1})"
echo ""

print_command "curl -s '$TRPC_BASE/users.getAll'"
echo "# Get all users"
echo ""

print_command "curl -s '$TRPC_BASE/users.search?input=%7B%22query%22%3A%22john%22%7D'"
echo "# Search users (URL encoded JSON: {\"query\":\"john\"})"
echo ""

echo -e "${GREEN}🔄 Mutation Examples (POST requests):${NC}"
echo ""

print_command "curl -X POST '$TRPC_BASE/posts.create' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"title\":\"New Post\",\"content\":\"Post content\",\"authorId\":1}'"
echo "# Create a new post"
echo ""

print_command "curl -X POST '$TRPC_BASE/users.create' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"age\":30}'"
echo "# Create a new user"
echo ""

print_command "curl -X POST '$TRPC_BASE/posts.update' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"id\":1,\"title\":\"Updated Title\"}'"
echo "# Update a post"
echo ""

print_command "curl -X POST '$TRPC_BASE/users.delete' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"id\":1}'"
echo "# Delete a user"
echo ""

print_section "Batch Requests (Advanced)"

echo "tRPC also supports batch requests:"
echo ""

print_command "curl -X POST '$TRPC_BASE/batch' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"0\": {\"query\": \"users.getAll\"},"
echo "    \"1\": {\"query\": \"posts.getAll\"}"
echo "  }'"
echo "# Execute multiple queries in one request"
echo ""

print_section "WebSocket Subscriptions (Advanced)"

echo "For real-time subscriptions (when implemented):"
echo ""
echo "wscat -c ws://localhost:3000/trpc"
echo "# Connect to WebSocket for subscriptions"
echo ""

print_section "Integration Instructions"

echo "To add full tRPC HTTP support to your NestJS app:"
echo ""
echo "1. Install tRPC Express adapter:"
echo "   npm install @trpc/server"
echo ""
echo "2. Add HTTP adapter in main.ts:"
echo "   import { createExpressMiddleware } from '@trpc/server/adapters/express';"
echo ""
echo "3. Configure the adapter:"
echo "   const trpcRouter = app.get(AppService).getTrpcRouter();"
echo "   app.use('/trpc', createExpressMiddleware({ router: trpcRouter }));"
echo ""

print_section "Testing Tools"

echo "Recommended tools for testing tRPC APIs:"
echo ""
echo "• curl - command line HTTP client"
echo "• httpie - user-friendly HTTP client"
echo "• Postman - GUI HTTP client"
echo "• tRPC Panel - auto-generated admin panel"
echo "• WebSocket clients for subscriptions"
echo ""

echo -e "${GREEN}🎉 Demo completed! Your tRPC NestJS integration is ready for HTTP adapter.${NC}" 
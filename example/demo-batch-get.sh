#!/bin/bash

# Demo script for testing GET batch functionality in tRPC NestJS Decorators 

echo "🚀 Starting tRPC NestJS Example server..."
npm start &
SERVER_PID=$!

# Wait for server to start
echo "⏳ Waiting for server to start..."
sleep 5

echo ""
echo "📊 Server info:"
curl -s http://localhost:3000/api/trpc | jq .

echo ""
echo "🔥 Testing GET Batch functionality:"
echo ""

echo "1️⃣ Simple batch request without parameters:"
echo "GET /api/trpc/users.getAll,posts.getAll?batch=1"
curl -s "http://localhost:3000/api/trpc/users.getAll,posts.getAll?batch=1" | jq .

echo ""
echo "2️⃣ Batch request with input parameters:"
echo 'GET /api/trpc/users.getById,posts.getById?batch=1&input={"0":{"json":{"id":1}},"1":{"json":{"id":2}}}'
curl -s 'http://localhost:3000/api/trpc/users.getById,posts.getById?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22id%22%3A1%7D%7D%2C%221%22%3A%7B%22json%22%3A%7B%22id%22%3A2%7D%7D%7D' | jq .

echo ""
echo "3️⃣ Mixed procedures batch request:"
echo 'GET /api/trpc/users.getAll,users.getById,posts.getAll?batch=1&input={"1":{"json":{"id":1}}}'
curl -s 'http://localhost:3000/api/trpc/users.getAll,users.getById,posts.getAll?batch=1&input=%7B%221%22%3A%7B%22json%22%3A%7B%22id%22%3A1%7D%7D%7D' | jq .

echo ""
echo "4️⃣ Testing backward compatibility - single GET request:"
echo "GET /api/trpc/users.getAll"
curl -s "http://localhost:3000/api/trpc/users.getAll" | jq .

echo ""
echo "5️⃣ Testing POST batch (original format):"
echo "POST /api/trpc"
curl -s -X POST http://localhost:3000/api/trpc \
  -H "Content-Type: application/json" \
  -d '{
    "0": { "procedure": "users.getAll", "input": {} },
    "1": { "procedure": "posts.getById", "input": { "id": 1 } }
  }' | jq .

echo ""
echo "✅ All tests completed!"
echo ""
echo "🛑 Stopping server..."
kill $SERVER_PID
wait $SERVER_PID 2>/dev/null

echo "✨ Demo finished!" 
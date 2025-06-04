# 🚀 Demo Instructions: tRPC NestJS Decorators

This file contains step-by-step instructions for demonstrating all capabilities of the `trpc-nest-decorators` package.

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm or yarn
- curl (for HTTP requests)
- python3 (for JSON formatting, optional)

## 🛠️ Setup

### 1. Install and build the main package

```bash
cd ../packages/trpc-nest-decorators
npm install
npm run build
```

### 2. Install example dependencies

```bash
cd ../example
npm install
```

### 3. Build the example

```bash
npm run build
```

### 4. Start the server

```bash
npm start
```

The server will start at http://localhost:3000

## 🎯 Demo Scenarios

### Scenario 1: Quick testing of basic functionality

**Execution time:** ~2 minutes

```bash
# Run a simple test
./test-current-api.sh
```

**What is demonstrated:**
- ✅ Server functionality check
- ✅ Getting information about registered controllers
- ✅ Automatically generated tRPC router schema
- ✅ Basic example of calling `posts.getAll`

### Scenario 2: Full demonstration of all capabilities

**Execution time:** ~5 minutes

```bash
# Run full demonstration
./trpc-demo-working.sh
```

**What is demonstrated:**
- 📊 Query operations (getAll, getById, search)
- 🔄 Mutation operations (create, update, delete)
- 🛡️ Input data validation
- ❌ Error handling
- 📈 Real-time change verification
- ⚡ Performance testing

### Scenario 3: Conceptual examples for production

**Execution time:** ~3 minutes

```bash
# View examples for full integration
./demo-trpc-calls.sh
```

**What is demonstrated:**
- 🔮 Examples with full tRPC HTTP adapter
- 📡 GET requests for query operations
- 📤 POST requests for mutations
- 🔄 Batch requests
- 🌐 WebSocket subscriptions
- 📚 Integration instructions

## 🧪 Manual Tests

### Test 1: Basic endpoints

```bash
# Application information
curl http://localhost:3000/api

### Test 2: Query operations

```bash
# Get all users
curl -X POST http://localhost:3000/api/trpc/users.getAll \
  -H "Content-Type: application/json" \
  -d "{}"

# Get all posts
curl -X POST http://localhost:3000/api/trpc/posts.getAll \
  -H "Content-Type: application/json" \
  -d "{}"

# Get user by ID
curl -X POST http://localhost:3000/api/trpc/users.getById \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'

# Search users
curl -X POST http://localhost:3000/api/trpc/users.search \
  -H "Content-Type: application/json" \
  -d '{"query": "john"}'
```

### Test 3: Mutation operations

```bash
# Create a new user
curl -X POST http://localhost:3000/api/trpc/users.create \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Johnson", "email": "alice@example.com", "age": 28}'

# Create a new post
curl -X POST http://localhost:3000/api/trpc/posts.create \
  -H "Content-Type: application/json" \
  -d '{"title": "Demo Post", "content": "This is a demo post!", "authorId": 1}'

# Update a post
curl -X POST http://localhost:3000/api/trpc/posts.update \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "title": "Updated Title", "content": "Updated content"}'
```

### Test 4: Error handling

```bash
# Non-existent procedure
curl -X POST http://localhost:3000/api/trpc/invalid.method \
  -H "Content-Type: application/json" \
  -d "{}"

# Invalid procedure format
curl -X POST http://localhost:3000/api/trpc/invalidformat \
  -H "Content-Type: application/json" \
  -d "{}"

# Non-existent user
curl -X POST http://localhost:3000/api/trpc/users.getById \
  -H "Content-Type: application/json" \
  -d '{"id": 999}'
```

## 🎨 Presentation Demo

### Slide 1: Introduction
```bash
# Show basic information
curl http://localhost:3000/api | python3 -m json.tool
```

### Slide 2: Ease of use
```bash
# Show how easy it is to call a procedure
curl -X POST http://localhost:3000/api/trpc/posts.getAll \
  -H "Content-Type: application/json" \
  -d "{}" | python3 -m json.tool
```

### Slide 3: Data validation
```bash
# Show creation with validation
curl -X POST http://localhost:3000/api/trpc/users.create \
  -H "Content-Type: application/json" \
  -d '{"name": "John", "email": "john@test.com", "age": 25}' | python3 -m json.tool
```

### Slide 4: Error handling
```bash
# Show graceful error handling
curl -X POST http://localhost:3000/api/trpc/users.getById \
  -H "Content-Type: application/json" \
  -d '{"id": 999}' | python3 -m json.tool
```

## 📊 Performance Analysis

### Single request response time

```bash
# Measure response time
time curl -X POST http://localhost:3000/api/trpc/posts.getAll \
  -H "Content-Type: application/json" \
  -d "{}" > /dev/null 2>&1
```

### Multiple requests

```bash
# Test multiple calls
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/trpc/users.getAll \
    -H "Content-Type: application/json" \
    -d "{}" -s -w "Request $i: %{time_total}s\n" -o /dev/null
done
```

### Load testing (if ab is installed)

```bash
# Apache Bench testing (optional)
ab -n 100 -c 10 -T 'application/json' -p data.json \
   http://localhost:3000/api/trpc/posts.getAll
```

Where `data.json` contains: `{}`

## 🔧 Configuration for Different Scenarios

### Development

```bash
# Run in development mode
npm run start:dev
```

### Production

```bash
# Build for production
npm run build

# Run production version
npm start
```

### Debug

```bash
# Run with extended logging
DEBUG=* npm start
```

## 📝 Response Examples

### Successful response

```json
{
  "procedure": "posts.getAll",
  "input": {},
  "result": [
    {
      "id": 1,
      "title": "First Post",
      "content": "This is the first post content",
      "authorId": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "timestamp": "2025-06-04T16:52:54.411Z"
}
```

### Error response

```json
{
  "error": "Router 'invalid' not found. Available: users, posts",
  "procedure": "invalid.method",
  "timestamp": "2025-06-04T16:53:00.123Z"
}
```

## 🎯 Key Points for Demonstration

1. **Integration simplicity**: Just add decorators to existing controllers
2. **Automatic generation**: tRPC routers are created automatically
3. **Type safety**: Full TypeScript support
4. **Validation**: Zod integration out of the box
5. **DI compatibility**: Works with existing NestJS DI system
6. **Flexibility**: Supports query, mutation, and subscription
7. **Performance**: Minimal overhead

## 🚨 Common Issues

### Server won't start
```bash
# Check port
lsof -i :3000

# Kill process if needed
pkill -f "node.*nest"
```

### curl errors
```bash
# Make sure server is running
curl http://localhost:3000/api

# Check JSON format
echo '{"id": 1}' | python3 -m json.tool
```

### Dependencies
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## 💡 Additional Resources

- [tRPC Documentation](https://trpc.io)
- [NestJS Documentation](https://nestjs.com)
- [Zod Documentation](https://zod.dev)
- [TypeScript Documentation](https://typescriptlang.org)

---

**Happy demonstrating! 🎉** 
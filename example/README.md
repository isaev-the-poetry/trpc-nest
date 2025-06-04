# tRPC NestJS Example

Example application demonstrating the use of `trpc-nest-decorators` for creating tRPC routers from NestJS controllers.

## Features

- ✨ Automatic creation of tRPC routers from NestJS controllers
- 🔄 Short decorators: `@Router`, `@Query`, `@Mutation`, `@Subscription`
- 🛡️ Data validation using Zod schemas
- 🚀 Full integration with NestJS dependency injection
- 🔗 HTTP endpoints for testing tRPC procedures
- 📊 Automatic controller registration

## Project Structure

```
example/
├── src/
│   ├── users/               # Users controller
│   │   └── users.controller.ts
│   ├── posts/               # Posts controller
│   │   └── posts.controller.ts
│   ├── app.controller.ts    # Main controller with demo endpoints
│   ├── app.service.ts       # Service with automatic router
│   ├── app.module.ts        # Main application module
│   └── main.ts              # Entry point
├── demo-trpc-calls.sh       # Demo script with tRPC HTTP adapter examples
├── test-current-api.sh      # Current API testing
├── trpc-demo-working.sh     # Full demo with working examples
└── README.md
```

## Installation and Running

### 1. Install Dependencies

```bash
npm install
```

### 2. Build

```bash
npm run build
```

### 3. Run Application

```bash
npm start
```

Or in development mode:

```bash
npm run start:dev
```

The application will be available at: http://localhost:3000

## Available Endpoints

### Information endpoints

- `GET /api` - application information and registered controllers

### tRPC HTTP endpoints

- `POST /api/trpc/:procedure` - tRPC procedure call

## Usage Examples

### Via curl

#### Query operations (data retrieval)

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

#### Mutation operations (data modification)

```bash
# Create a new user
curl -X POST http://localhost:3000/api/trpc/users.create \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice Johnson", "email": "alice@example.com", "age": 28}'

# Create a new post
curl -X POST http://localhost:3000/api/trpc/posts.create \
  -H "Content-Type: application/json" \
  -d '{"title": "My Post", "content": "Post content", "authorId": 1}'

# Update a post
curl -X POST http://localhost:3000/api/trpc/posts.update \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "title": "Updated Title"}'
```

## Demo Scripts

The project includes several shell scripts to demonstrate functionality:

### 1. Simple current API testing

```bash
./test-current-api.sh
```

This script:
- Checks that the server is running
- Shows application information
- Demonstrates a basic tRPC call

### 2. Full demonstration of working examples

```bash
./trpc-demo-working.sh
```

This script demonstrates:
- ✅ Query procedures (getAll, getById, search)
- ✅ Mutation procedures (create, update, delete)
- ✅ Input data validation with Zod schemas
- ✅ Error handling for invalid calls
- ✅ Real-time data persistence
- ✅ Performance with multiple calls

### 3. Examples for future tRPC HTTP Adapter integration

```bash
./demo-trpc-calls.sh
```

This script shows:
- How calls will look with full tRPC HTTP adapter
- GET request examples for queries
- POST request examples for mutations
- Batch requests
- WebSocket subscriptions

## Controllers

### UsersController

Controller for user management with procedures:

- `getAll` - get all users
- `getById` - get user by ID
- `create` - create a new user
- `delete` - delete a user
- `search` - search users by name/email

### PostsController

Controller for post management with procedures:

- `getAll` - get all posts
- `getById` - get post by ID
- `getByAuthor` - get posts by author
- `create` - create a new post
- `update` - update a post
- `delete` - delete a post

## Architecture

### Automatic Registration

```typescript
@Injectable()
export class AppService {
  constructor(
    private readonly autoRouterService: AutoRouterService,
    private readonly usersController: UsersController,
    private readonly postsController: PostsController
  ) {
    // Automatic controller registration
    this.autoRouterService.registerController(UsersController, this.usersController);
    this.autoRouterService.registerController(PostsController, this.postsController);
  }

  getTrpcRouter() {
    return createMainRouter(); // Get automatically created router
  }
}
```

### Decorators

```typescript
@Router({ prefix: 'users' })
@Injectable()
export class UsersController {
  @Query('getAll')
  async getAllUsers() { /* ... */ }
  
  @Mutation('create', { input: CreateUserSchema })
  async createUser(input: CreateUserInput) { /* ... */ }
}
```

## Next Steps

1. **Frontend integration**: connect React, Vue, or other frameworks
2. **Authentication**: add JWT or other authorization system
3. **Validation**: extend Zod schemas for all endpoints
4. **Database**: replace in-memory storage with real database
5. **WebSocket subscriptions**: add real-time updates
6. **Production ready**: add logging, monitoring, tests

## Performance

The demo shows that the system can handle multiple requests with minimal latency and automatically manage controller lifecycle through NestJS dependency injection.

## License

MIT 
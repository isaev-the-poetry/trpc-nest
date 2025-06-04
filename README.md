# tRPC NestJS Decorators

🚀 NestJS functionality extension for creating tRPC routers using decorators with **tRPC v11** support.

## Project Description

This project contains the `trpc-nest-decorators` npm package, which allows easy integration of tRPC v11 into NestJS applications using decorators. The package provides a simple way to convert regular NestJS controllers into tRPC routers with automatic main router generation and support for all new tRPC v11 features.

## Project Structure

```
trpc-nest-decorators/
├── packages/
│   └── trpc-nest-decorators/    # Main npm package
│       ├── src/
│       │   ├── decorators.ts     # Decorators (@Router, @Query, @Mutation)
│       │   ├── types.ts          # TypeScript types and interfaces
│       │   ├── trpc-router.service.ts  # Service for generating tRPC routers
│       │   ├── auto-router.service.ts  # Automatic router
│       │   ├── trpc-nest.module.ts     # NestJS module
│       │   ├── main-router.ts    # Utility functions
│       │   └── index.ts          # Public API exports
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
└── example/                     # Test NestJS application
    ├── src/
    │   ├── users/               # Users controller example
    │   ├── posts/               # Posts controller example
    │   ├── app.controller.ts    # Demo endpoints
    │   ├── app.service.ts       # Service with automatic router
    │   ├── app.module.ts        # Main module
    │   └── main.ts              # Entry point
    ├── package.json
    └── README.md
```

## Package Features

### ✨ Core Functions

- **Short decorators**: `@Router`, `@Query`, `@Mutation`, `@Subscription`
- **Automatic router generation**: converting NestJS controllers to tRPC routers
- **Automatic main router**: combining all controllers into one router
- **Data validation**: Zod integration for input and output data
- **Dependency Injection**: full support for NestJS DI system
- **TypeScript support**: full typing for type safety
- **Backward compatibility**: old decorators with `Trpc` prefix still work

### 🎯 Advantages

- **Ease of use**: familiar NestJS decorator syntax
- **Minimal setup**: easily integrates with existing projects
- **Automation**: no need to manually create and combine routers
- **Flexibility**: preserves all NestJS and tRPC capabilities
- **Performance**: efficient router generation

## Quick Start

### 1. Build Package

```bash
cd packages/trpc-nest-decorators
npm install
npm run build
```

### 2. Run Example

```bash
cd example
npm install
npm run build
npm start
```

### 3. Testing

Open your browser and navigate to:
- http://localhost:3000/api - application information

## Usage in Your Project

### Installation

```bash
npm install trpc-nest-decorators @trpc/server zod
```

### Creating a Controller

```typescript
import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation } from 'trpc-nest-decorators';
import { z } from 'zod';

@Router({ prefix: 'users' })
@Injectable()
export class UsersController {
  @Query('getAll')
  async getAllUsers() {
    return [{ id: 1, name: 'John' }];
  }

  @Mutation('create', {
    input: z.object({ name: z.string().min(1) })
  })
  async createUser(input: { name: string }) {
    return { id: Date.now(), name: input.name };
  }
}
```

### Module Integration

```typescript
import { Module } from '@nestjs/common';
import { TrpcNestModule } from 'trpc-nest-decorators';

@Module({
  imports: [TrpcNestModule.forRoot()],
  // ... other settings
})
export class AppModule {}
```

### Automatic Router

```typescript
import { Injectable } from '@nestjs/common';
import { createMainRouter, AutoRouterService } from 'trpc-nest-decorators';

@Injectable()
export class AppService {
  constructor(
    private readonly autoRouterService: AutoRouterService,
    private readonly usersController: UsersController
  ) {
    // Register controller
    this.autoRouterService.registerController(UsersController, this.usersController);
  }

  getTrpcRouter() {
    // Get automatically created router
    return createMainRouter();
  }
}
```

## Available Decorators

### `@Router(options?)`
Marks a class as a tRPC router
- `options.prefix` - prefix for all procedures

### `@Query(path?, options?)`
Creates a tRPC query procedure
- `path` - procedure path (optional)
- `options.input` - input data validation schema
- `options.output` - output data validation schema

### `@Mutation(path?, options?)`
Creates a tRPC mutation procedure

### `@Subscription(path?, options?)`
Creates a tRPC subscription procedure

## Utility Functions

### `createMainRouter()`
Returns automatically created main tRPC router

### `getRegisteredControllers()`
Returns information about registered controllers

## Examples

In the `example/` folder you'll find a complete working example with:
- Users and posts controllers
- Data validation through Zod
- Different types of tRPC procedures
- Automatic main router generation
- Full integration with NestJS DI

## Backward Compatibility

Old decorators with `Trpc` prefix are still supported:

```typescript
// Old syntax (still works)
import { TrpcRouter, TrpcQuery, TrpcMutation } from 'trpc-nest-decorators';

// New syntax (recommended)
import { Router, Query, Mutation } from 'trpc-nest-decorators';
```

## Development Plans

- [x] Short decorators without prefix
- [x] Automatic main router
- [x] **tRPC v11 support**
- [x] **FormData / Non-JSON Content Types**
- [x] **Streaming Responses**
- [x] **Server-Sent Events Subscriptions**
- [x] **Enhanced subscriptions with generators**
- [x] **Shorthand Router Definitions**
- [ ] HTTP adapter integration
- [ ] Middleware support
- [ ] Authentication and authorization
- [ ] Extended typing
- [ ] API documentation
- [ ] Tests
- [ ] **TanStack Query v5 integration**
- [ ] **React Server Components support**

## License

MIT

## Contributing

We welcome your participation! Create issues and pull requests.

---

**Note**: This package is in development stage. For production use, additional testing and configuration is recommended.

## 🆕 New tRPC v11 Features

### FormData / Non-JSON Content Types Support

Support for various content types, including `FormData`, `Blob`, `File`, `Uint8Array`, and `ReadableStream`:

```typescript
import { FormDataMutation, BinaryMutation, formDataParser, octetInputParser } from 'trpc-nest-decorators';

@Router({ prefix: 'upload' })
export class UploadController {
  
  // FormData support
  @FormDataMutation('form-upload', {
    input: formDataParser
  })
  async uploadForm(formData: FormData) {
    const name = formData.get('name') as string;
    const file = formData.get('file') as File;
    return { name, fileName: file.name, size: file.size };
  }

  // Binary data support
  @BinaryMutation('binary-upload', {
    input: octetInputParser
  })
  async uploadBinary(stream: ReadableStream) {
    // Process binary stream
    return { processed: true };
  }

  // Blob support
  @Mutation('blob-upload', {
    input: z.instanceof(Blob)
  })
  async uploadBlob(blob: Blob) {
    return { type: blob.type, size: blob.size };
  }
}
```

### Streaming Responses

Support for streaming responses to work with large amounts of data:

```typescript
import { StreamingQuery, createStreamingResponse } from 'trpc-nest-decorators';

@Router({ prefix: 'streaming' })
export class StreamingController {
  
  @StreamingQuery('stream-data')
  async streamData() {
    // Async generator for streaming
    return (async function* () {
      for (let i = 0; i < 100; i++) {
        await new Promise(resolve => setTimeout(resolve, 100));
        yield { count: i, timestamp: new Date() };
      }
    })();
  }

  @StreamingQuery('stream-users')
  async streamUsers() {
    const users = await this.getAllUsers(); // Get all users
    return createStreamingResponse(users, {
      batchSize: 10,
      delayMs: 500
    });
  }
}
```

### Server-Sent Events Subscriptions

Enhanced subscriptions with Server-Sent Events support:

```typescript
import { SSESubscription } from 'trpc-nest-decorators';

@Router({ prefix: 'realtime' })
export class RealtimeController {
  
  @SSESubscription('live-updates')
  async liveUpdates() {
    return (async function* () {
      let counter = 0;
      while (true) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        yield {
          id: counter++,
          message: `Live update #${counter}`,
          timestamp: new Date()
        };
      }
    })();
  }

  @SSESubscription('notifications', {
    input: z.object({ userId: z.string() })
  })
  async userNotifications(input: { userId: string }) {
    // Generate notifications for user
    return this.generateNotifications(input.userId);
  }
}
```

### Shorthand Router Definitions

Simplified router definitions:

```typescript
// Now you can use simple objects to create sub-routers
const appRouter = router({
  // Shorthand - simple object creates sub-router
  users: {
    getAll: publicProcedure.query(() => getAllUsers()),
    create: publicProcedure.input(z.object({ name: z.string() })).mutation(({ input }) => createUser(input))
  },
  
  // Equivalent to:
  posts: router({
    getAll: publicProcedure.query(() => getAllPosts()),
    create: publicProcedure.input(z.object({ title: z.string() })).mutation(({ input }) => createPost(input))
  })
});
```

### New tRPC v11 Decorators

```typescript
// Specialized decorators for tRPC v11
@FormDataMutation() // For FormData
@BinaryMutation()   // For binary data
@StreamingQuery()   // For streaming
@SSESubscription()  // For Server-Sent Events

// New utilities
import {
  formDataParser,
  blobParser,
  fileParser,
  octetInputParser,
  createStreamingResponse,
  createSSEResponse,
  validateFormDataField,
  createFormDataSchema
} from 'trpc-nest-decorators';
```

### Example Using All Features

```typescript
@Router({ prefix: 'v11-demo' })
@Injectable()
export class TrpcV11DemoController {
  
  // FormData with validation
  @FormDataMutation('upload-profile', {
    input: createFormDataSchema({
      name: z.string().min(1),
      email: z.string().email(),
      avatar: z.instanceof(File)
    })
  })
  async uploadProfile(formData: FormData) {
    const name = validateFormDataField(formData, 'name', z.string());
    const email = validateFormDataField(formData, 'email', z.string().email());
    const avatar = formData.get('avatar') as File;
    
    return { name, email, avatarSize: avatar.size };
  }

  // Streaming large data
  @StreamingQuery('export-data', {
    input: z.object({ format: z.enum(['json', 'csv']) })
  })
  async exportData(input: { format: string }) {
    const data = await this.getAllData();
    return createStreamingResponse(data, { batchSize: 100 });
  }

  // Live notifications
  @SSESubscription('live-chat', {
    input: z.object({ roomId: z.string() })
  })
  async liveChat(input: { roomId: string }) {
    return this.generateChatMessages(input.roomId);
  }

  // Binary data processing
  @BinaryMutation('process-file')
  async processFile(stream: ReadableStream) {
    const chunks = [];
    const reader = stream.getReader();
    
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    
    return { 
      totalChunks: chunks.length,
      totalSize: chunks.reduce((sum, chunk) => sum + chunk.length, 0)
    };
  }
}
```

## Migration to tRPC v11

To update an existing project to tRPC v11:

1. **Update dependencies:**
```bash
npm install @trpc/server@^11.0.0 trpc-nest-decorators@^2.0.0
```

2. **Use new features:**
```typescript
// Old code remains compatible
@Query('users')
async getUsers() { /* ... */ }

// New v11 features
@StreamingQuery('users-stream')
async getUsersStream() { 
  return createStreamingResponse(await this.getUsers(), { batchSize: 10 });
}

@FormDataMutation('upload')
async upload(formData: FormData) { /* ... */ }
```

3. **Update imports:**
```typescript
// Add new imports for v11 functions
import { 
  FormDataMutation, 
  StreamingQuery, 
  SSESubscription,
  formDataParser,
  createStreamingResponse
} from 'trpc-nest-decorators';
```

## tRPC v11 Documentation

For additional information about tRPC v11, visit:
- [tRPC v11 Announcement](https://trpc.io/blog/announcing-trpc-v11)
- [Official tRPC Documentation](https://trpc.io/docs)
- [Migration Guide to v11](https://trpc.io/docs/migrate-from-v10-to-v11) 
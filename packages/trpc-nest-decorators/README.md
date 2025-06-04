# tRPC NestJS Decorators

A powerful package that brings tRPC integration to NestJS with decorators and automatic HTTP endpoints.

## Features

- 🎯 **Decorator-based tRPC procedures** - Use familiar NestJS-style decorators
- 🚀 **Automatic HTTP endpoints** - No need to manually set up HTTP routes
- 🔍 **Auto-discovery** - Automatically discover and register tRPC controllers
- 📝 **Type-safe** - Full TypeScript support with input/output validation
- 🔧 **Easy integration** - Works seamlessly with existing NestJS applications
- 📊 **Built-in monitoring** - Automatic endpoint documentation and schema generation

## Installation

```bash
npm install trpc-nest-decorators @trpc/server zod
```

## Quick Start

### 1. Set up the module

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TrpcNestModule } from 'trpc-nest-decorators';

@Module({
  imports: [
    TrpcNestModule.forRoot({
      autoDiscovery: true, // Enable automatic controller discovery
      enableHttpEndpoints: true, // Enable HTTP endpoints (default: true)
    }),
  ],
})
export class AppModule {}
```

### 2. Create a tRPC controller

```typescript
// users.controller.ts
import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation } from 'trpc-nest-decorators';
import { z } from 'zod';

@Router({ prefix: 'users' })
@Injectable()
export class UsersController {
  @Query('getAll')
  async getAllUsers() {
    return [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ];
  }

  @Query('getById', {
    input: z.object({ id: z.number() })
  })
  async getUserById(input: { id: number }) {
    return { id: input.id, name: 'User', email: 'user@example.com' };
  }

  @Mutation('create', {
    input: z.object({
      name: z.string(),
      email: z.string().email(),
    })
  })
  async createUser(input: { name: string; email: string }) {
    return { id: 3, ...input };
  }
}
```

### 3. Register the controller in a module

```typescript
// users.module.ts
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';

@Module({
  providers: [UsersController],
})
export class UsersModule {}
```

## Auto-Discovery

The package now supports automatic discovery of tRPC controllers. When `autoDiscovery: true` is set in the module options, the package will automatically:

1. **Scan for controllers** - Find all classes decorated with `@Router`
2. **Register procedures** - Automatically register all `@Query`, `@Mutation`, and `@Subscription` methods
3. **Generate routes** - Create HTTP endpoints for all procedures
4. **Build main router** - Combine all controllers into a single tRPC router

### Manual Registration (Alternative)

If you prefer manual control, you can disable auto-discovery and register controllers manually:

```typescript
// app.service.ts
import { Injectable } from '@nestjs/common';
import { AutoRouterService } from 'trpc-nest-decorators';
import { UsersController } from './users/users.controller';

@Injectable()
export class AppService {
  constructor(
    private readonly autoRouterService: AutoRouterService,
    private readonly usersController: UsersController
  ) {
    // Manual registration
    this.autoRouterService.registerController(UsersController, this.usersController);
  }
}
```

## Available Endpoints

When HTTP endpoints are enabled, the following routes are automatically created:

- `GET /api/trpc` - Application info and registered controllers
- `GET /api/trpc-schema` - tRPC schema information
- `POST /api/trpc/:procedure` - Single procedure call
- `GET /api/trpc/:procedure` - GET procedure call (for queries with URL parameters)
- `GET /api/trpc/:procedures?batch=1` - **NEW**: GET batch calls  
- `POST /api/trpc` - Batch procedure calls

### Example API calls:

```bash
# Get all users (single request)
curl "http://localhost:3000/api/trpc/users.getAll"

# Get user by ID
curl "http://localhost:3000/api/trpc/users.getById?input={\"id\":1}"

# Create user (POST)
curl -X POST "http://localhost:3000/api/trpc/users.create" \
  -H "Content-Type: application/json" \
  -d '{"name":"New User","email":"new@example.com"}'

# GET Batch requests  
curl "http://localhost:3000/api/trpc/users.getAll,posts.getAll?batch=1"

# GET Batch with input parameters
curl "http://localhost:3000/api/trpc/users.getById,posts.getById?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22id%22%3A1%7D%7D%2C%221%22%3A%7B%22json%22%3A%7B%22id%22%3A2%7D%7D%7D"

# POST Batch (original tRPC format)
curl -X POST "http://localhost:3000/api/trpc" \
  -H "Content-Type: application/json" \
  -d '{
    "0": { "procedure": "users.getAll", "input": {} },
    "1": { "procedure": "posts.getById", "input": { "id": 1 } }
  }'
```

### GET Batch Format  

The new GET batch format supports the same structure:

```
GET /api/trpc/procedure1,procedure2,procedure3?batch=1&input=encodedJSON
```

Where:
- **procedures**: Comma-separated list of procedure names (e.g., `users.getAll,posts.getById`)
- **batch=1**: Required parameter to enable batch mode
- **input**: URL-encoded JSON with indexed input data:
  ```json
  {
    "0": { "json": { "id": 126 } },
    "1": { "json": { "id": 126 } },
    "2": { "json": { "id": 1783 } }
  }
  ```

Response format:
```json
{
  "0": { "result": [...], "timestamp": "2025-06-04T18:12:56.320Z" },
  "1": { "result": [...], "timestamp": "2025-06-04T18:12:56.320Z" }
}
```

## Decorators

### @Router(options?)

Marks a class as a tRPC router.

```typescript
@Router({ prefix: 'users' })
export class UsersController {}
```

### @Query(path?, options?)

Marks a method as a tRPC query procedure.

```typescript
@Query('getAll')
async getAllUsers() {}

@Query('getById', { input: z.object({ id: z.number() }) })
async getUserById(input: { id: number }) {}
```

### @Mutation(path?, options?)

Marks a method as a tRPC mutation procedure.

```typescript
@Mutation('create', { 
  input: z.object({ name: z.string() }) 
})
async createUser(input: { name: string }) {}
```

### @Subscription(path?, options?)

Marks a method as a tRPC subscription procedure.

```typescript
@Subscription('userUpdates')
async userUpdates() {
  // Return observable
}
```

## Configuration

### TrpcNestModuleOptions

```typescript
interface TrpcNestModuleOptions {
  autoDiscovery?: boolean;        // Enable auto-discovery (default: false)
  enableHttpEndpoints?: boolean;  // Enable HTTP endpoints (default: true)
  httpPrefix?: string;           // HTTP route prefix (default: 'api/trpc')
  controllers?: Type<any>[];     // Manual controller list (when autoDiscovery is false)
}
```

## Advanced Usage

### Getting the tRPC Router

```typescript
import { createMainRouter } from 'trpc-nest-decorators';

const router = createMainRouter();
```

### Getting Registered Controllers Info

```typescript
import { getRegisteredControllers } from 'trpc-nest-decorators';

const controllers = getRegisteredControllers();
```

## Migration from Manual Registration

If you're upgrading from a version without auto-discovery:

1. **Enable auto-discovery** in your module:
   ```typescript
   TrpcNestModule.forRoot({ autoDiscovery: true })
   ```

2. **Remove manual registration** calls:
   ```typescript
   // Remove these lines:
   // this.autoRouterService.registerController(UsersController, this.usersController);
   ```

3. **Ensure controllers are providers** in their respective modules:
   ```typescript
   @Module({
     providers: [UsersController], // Make sure this is present
   })
   export class UsersModule {}
   ```

## License

MIT

## 🎯 Интеграция с tRPC клиентом

Автоматические endpoints полностью совместимы с официальным tRPC клиентом:

```typescript
// client.ts
import { createTRPCClient, httpBatchLink } from '@trpc/client';

const client = createTRPCClient({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
    }),
  ],
});

// Использование
const users = await client.users.getAll.query();
const user = await client.users.getById.query({ id: 1 });
const newUser = await client.users.create.mutate({
  name: 'Charlie',
  email: 'charlie@example.com',
  age: 28
});
```

## 🔧 Декораторы

### @Router
Помечает класс как tRPC роутер:

```typescript
@Router({ prefix: 'users' })
@Injectable()
export class UsersController {}
```

### @Query
Помечает метод как query операцию:

```typescript
@Query('getAll')
async getAllUsers() {}

@Query('getById', {
  input: z.object({ id: z.number() })
})
async getUserById(input: { id: number }) {}
```

### @Mutation
Помечает метод как mutation операцию:

```typescript
@Mutation('create', {
  input: CreateUserSchema
})
async createUser(input: CreateUserInput) {}
```

### @Subscription
Помечает метод как subscription операцию:

```typescript
@Subscription('userUpdates')
async userUpdates() {}
```

## ⚙️ Конфигурация

### Опции модуля

```typescript
TrpcNestModule.forRoot({
  enableHttpEndpoints: true,  // Включить автоматические HTTP endpoints (по умолчанию: true)
  httpPrefix: 'api',          // Префикс для HTTP endpoints (будущая функция)
})
```

### Отключение HTTP endpoints

```typescript
TrpcNestModule.forRoot({
  enableHttpEndpoints: false  // Отключает автоматические endpoints
})
```

## 🔄 Обратная совместимость

Пакет поддерживает старые имена декораторов:

```typescript
// Новые (рекомендуемые)
@Router()
@Query()
@Mutation()
@Subscription()

// Старые (поддерживаются)
@TrpcRouter()
@TrpcQuery()
@TrpcMutation()
@TrpcSubscription()
```

## 📊 Производительность

- **Batch запросы**: Выполняются параллельно для максимальной производительности
- **Минимальные накладные расходы**: Прямые вызовы методов контроллеров
- **Кэширование роутеров**: Роутеры создаются один раз при регистрации

## 🛡️ Обработка ошибок

Автоматическая обработка ошибок с подробными сообщениями:

```json
{
  "error": "Procedure 'getById' not found in controller 'users'",
  "procedure": "users.getById",
  "timestamp": "2025-06-04T17:15:13.839Z"
}
```

Batch запросы обрабатывают ошибки индивидуально:

```json
{
  "0": { "result": [...] },
  "1": { "error": { "message": "User not found", "code": "NOT_FOUND" } }
}
```

## 📚 Примеры

Полные примеры доступны в папке `example/`:

- Базовая настройка
- Контроллеры с валидацией
- Демо скрипты для тестирования
- Интеграция с фронтендом

## 🤝 Совместимость

- **NestJS**: 8.x, 9.x, 10.x
- **tRPC**: 10.x, 11.x
- **TypeScript**: 4.5+
- **Node.js**: 16+

## 📝 Лицензия

MIT

## 🚀 Roadmap

- [ ] WebSocket поддержка для subscriptions
- [ ] Middleware для аутентификации
- [ ] Автоматическая генерация OpenAPI схем
- [ ] Интеграция с NestJS Guards и Interceptors
- [ ] Поддержка custom transformers 
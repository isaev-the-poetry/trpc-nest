# tRPC NestJS Decorators

Пакет для интеграции tRPC с NestJS через декораторы с автоматической генерацией HTTP endpoints.

## ✨ Возможности

- 🚀 **Автоматические HTTP endpoints** - генерируются из декораторов без дополнительной настройки
- 🔄 **Поддержка tRPC HTTP Batch Link** - совместимость с официальным клиентом tRPC
- 📊 **Короткие декораторы**: `@Router`, `@Query`, `@Mutation`, `@Subscription`
- 🛡️ **Валидация данных** с помощью Zod схем
- 🔗 **Полная интеграция с NestJS DI** - работает с существующими сервисами
- ⚡ **Высокая производительность** - минимальные накладные расходы
- 🎯 **TypeScript поддержка** - полная типизация из коробки

## 📦 Установка

```bash
npm install trpc-nest-decorators @trpc/server zod
```

## 🚀 Быстрый старт

### 1. Настройка модуля

```typescript
// app.module.ts
import { Module } from '@nestjs/common';
import { TrpcNestModule } from 'trpc-nest-decorators';

@Module({
  imports: [
    TrpcNestModule.forRoot({
      enableHttpEndpoints: true, // Включает автоматические HTTP endpoints
    }),
  ],
})
export class AppModule {}
```

### 2. Создание контроллера с tRPC декораторами

```typescript
// users.controller.ts
import { Injectable } from '@nestjs/common';
import { Router, Query, Mutation } from 'trpc-nest-decorators';
import { z } from 'zod';

const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().min(0)
});

@Router({ prefix: 'users' })
@Injectable()
export class UsersController {
  private users = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 }
  ];

  @Query('getAll')
  async getAllUsers() {
    return this.users;
  }

  @Query('getById', {
    input: z.object({ id: z.number() })
  })
  async getUserById(input: { id: number }) {
    return this.users.find(user => user.id === input.id);
  }

  @Mutation('create', {
    input: CreateUserSchema
  })
  async createUser(input: z.infer<typeof CreateUserSchema>) {
    const newUser = {
      id: Date.now(),
      ...input
    };
    this.users.push(newUser);
    return newUser;
  }
}
```

### 3. Регистрация контроллера

```typescript
// app.service.ts
import { Injectable } from '@nestjs/common';
import { AutoRouterService } from 'trpc-nest-decorators';
import { UsersController } from './users.controller';

@Injectable()
export class AppService {
  constructor(
    private readonly autoRouterService: AutoRouterService,
    private readonly usersController: UsersController
  ) {
    // Автоматическая регистрация контроллера
    this.autoRouterService.registerController(UsersController, this.usersController);
  }
}
```

## 🌐 Автоматические HTTP Endpoints

После настройки автоматически доступны следующие endpoints:

### Информационный endpoint
```bash
GET /trpc
# Возвращает информацию о доступных процедурах и примеры использования
```

### Одиночные вызовы процедур
```bash
# POST запросы для всех операций
POST /trpc/:procedure
Content-Type: application/json
Body: { "input": "data" }

# GET запросы для query операций
GET /trpc/:procedure?input=encodedJSON
```

### Batch запросы (совместимо с tRPC HTTP Batch Link)
```bash
POST /trpc
Content-Type: application/json
Body: {
  "0": { "procedure": "users.getAll", "input": {} },
  "1": { "procedure": "users.getById", "input": { "id": 1 } }
}
```

## 📋 Примеры использования

### Одиночные запросы

```bash
# Получить всех пользователей
curl -X POST http://localhost:3000/trpc/users.getAll \
  -H "Content-Type: application/json" \
  -d "{}"

# Получить пользователя по ID (POST)
curl -X POST http://localhost:3000/trpc/users.getById \
  -H "Content-Type: application/json" \
  -d '{"id": 1}'

# Получить пользователя по ID (GET)
curl "http://localhost:3000/trpc/users.getById?input=%7B%22id%22%3A1%7D"

# Создать пользователя
curl -X POST http://localhost:3000/trpc/users.create \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@example.com", "age": 25}'
```

### Batch запросы

```bash
# Множественные запросы в одном HTTP вызове
curl -X POST http://localhost:3000/trpc \
  -H "Content-Type: application/json" \
  -d '{
    "0": { "procedure": "users.getAll", "input": {} },
    "1": { "procedure": "users.getById", "input": { "id": 1 } },
    "2": { "procedure": "users.create", "input": { "name": "Bob", "email": "bob@example.com", "age": 30 } }
  }'
```

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